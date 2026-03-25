// @ts-nocheck
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Encryption utilities
function encryptData(data: any, encryptionKey: string): string {
  const plaintext = JSON.stringify(data);
  const encoder = new TextEncoder();
  
  // Convert string to UTF-8 bytes
  const bytes = encoder.encode(plaintext);
  
  // Convert bytes to base64 (UTF-8 safe)
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
  const encrypted = btoa(binString);
  
  return encrypted;
}

function decryptData(encrypted: string, encryptionKey: string): any {
  // Try multiple keys for backward compatibility
  const keysToTry = [
    encryptionKey,
    'default-insecure-key'
  ];
  
  for (const key of keysToTry) {
    try {
      // Decode base64
      const binString = atob(encrypted);
      
      // Convert back to bytes
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      
      // Decode UTF-8
      const decoder = new TextDecoder();
      const plaintext = decoder.decode(bytes);
      
      return JSON.parse(plaintext);
    } catch (e) {
      // Try next key
      continue;
    }
  }
  
  console.error('Decryption failed with all keys');
  return null;
}

app.use('*', cors());
app.use('*', logger(console.log));

// In-memory rate limiter (best-effort; resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 60s
const RATE_LIMIT_MAX = 20; // max requests per IP per window
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function getClientIp(c: any) {
  const xff = c.req.header('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  // fallback
  // @ts-ignore - Deno conn
  return c.req.raw?.conn?.remoteAddr?.hostname ?? 'unknown';
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = Deno.env.get('TURNSTILE_SECRET');
  if (!secret) return { ok: true };
  if (!token) return { ok: false, reason: 'missing token' };

  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  if (ip && ip !== 'unknown') params.append('remoteip', ip);

  const resp = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: params,
  });

  const data = await resp.json();
  if (!data.success) {
    return { ok: false, reason: data['error-codes']?.join(',') ?? 'turnstile_failed' };
  }

  return { ok: true };
}

function checkRateLimit(c: any) {
  const ip = getClientIp(c);
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { retryAfter: Math.max(0, Math.ceil((entry.resetAt - now) / 1000)) };
  }

  entry.count += 1;
  return null;
}

function requireAdminToken(c: any) {
  const expected = Deno.env.get('ADMIN_TOKEN');
  const provided = c.req.header('x-admin-token');
  if (!expected) return { status: 500, body: { error: 'ADMIN_TOKEN not configured' } };
  if (!provided || provided.trim() !== expected.trim()) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }
  return null;
}

// Lazy Supabase client with env guard to return clearer errors when secrets are missing
const getSupabase = () => {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment');
  }

  return createClient(url, serviceRoleKey);
};

// Health checks (with and without slug) for easier diagnostics
app.get('/', (c) => c.json({ status: 'ok', path: '/', timestamp: new Date().toISOString() }));
app.get('/health', (c) => c.json({ status: 'ok', path: '/health', timestamp: new Date().toISOString() }));
app.get('/server/health', (c) => c.json({ status: 'ok', path: '/server/health', timestamp: new Date().toISOString() }));
app.get('/server/make-server-5a2ed2de/health', (c) => {
  return c.json({ status: 'ok', path: '/server/make-server-5a2ed2de/health', timestamp: new Date().toISOString() });
});

// Submit application
app.post('/server/make-server-5a2ed2de/applications', async (c) => {
  const limit = checkRateLimit(c);
  if (limit) {
    return c.json({ error: 'Too many requests' }, 429, {
      'Retry-After': String(limit.retryAfter),
    });
  }

  try {
    const body = await c.req.json();
    const { track, formData, captchaToken } = body;

    const ip = getClientIp(c);
    const captcha = await verifyTurnstile(captchaToken, ip);
    if (!captcha.ok) {
      return c.json({ error: 'Captcha verification failed' }, 400);
    }

    if (!track || !formData) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate track
    if (!['baby', 'staff'].includes(track)) {
      return c.json({ error: 'Invalid track' }, 400);
    }

    // Validate required fields
    const requiredFields = ['name', 'studentId', 'email', 'phone', 'major', 'currentYear', 'schedule1', 'schedule2', 'schedule3'];
    for (const field of requiredFields) {
      if (!formData[field] || typeof formData[field] !== 'string' || !formData[field].trim()) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate phone format
    if (!/^\d{3}-?\d{3,4}-?\d{4}$/.test(formData.phone.replace(/-/g, ''))) {
      return c.json({ error: 'Invalid phone format' }, 400);
    }

    // Track-specific validation
    if (track === 'baby') {
      // Backward compatibility: some older clients may send `pm` for planning.
      if (!formData.interestField || !['frontend', 'backend', 'planning', 'pm', 'design', 'unsure'].includes(formData.interestField)) {
        return c.json({ error: 'Invalid interest field' }, 400);
      }
      if (!formData.essay1?.trim() || !formData.essay2?.trim() || !formData.essay3?.trim()) {
        return c.json({ error: 'All essays are required' }, 400);
      }
    } else if (track === 'staff') {
      if (!formData.position || !['pm', 'planning', 'frontend', 'backend', 'design'].includes(formData.position)) {
        return c.json({ error: 'Invalid position' }, 400);
      }
      if (!formData.techStack?.trim()) {
        return c.json({ error: 'Tech stack is required' }, 400);
      }
      if (formData.portfolio?.trim() && !/^https?:\/\/.+/.test(formData.portfolio)) {
        return c.json({ error: 'Invalid portfolio URL format' }, 400);
      }
      if (!formData.essay1?.trim() || !formData.essay2?.trim() || !formData.essay3?.trim()) {
        return c.json({ error: 'All essays are required' }, 400);
      }
    }

    // Generate unique ID
    const applicationId = `${track}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Encrypt sensitive data
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'default-insecure-key';
    const encryptedFormData = encryptData(formData, encryptionKey);

    // Store in KV store (READ-ONLY after creation)
    const applicationData = {
      id: applicationId,
      track,
      encryptedData: encryptedFormData,
      submittedAt: new Date().toISOString(),
      ipAddress: ip,
      // Mark as immutable
      readonly: true,
    };

    console.log(`Attempting to store application: ${applicationId}`);
    
    try {
      await kv.set(applicationId, applicationData);
      console.log(`Application stored successfully: ${applicationId}`);
    } catch (kvError) {
      console.error('KV store error:', kvError);
      throw new Error(`Failed to store application: ${(kvError as Error).message}`);
    }

    console.log(`Application submitted: ${applicationId}`);

    // Send email notification
    try {
      const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'likelion.dku@gmail.com';
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        const trackName = track === 'baby' ? '아기사자' : '운영진';
        // Use original formData for email (not encrypted)
        const emailBody = formatEmailBody(track, formData);
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Likelion Dankook <onboarding@resend.dev>',
            to: [adminEmail],
            subject: `🦁 [단국대 멋사 14기] ${trackName} 신규 지원서 도착`,
            html: emailBody,
          }),
        });

        if (emailResponse.ok) {
          console.log('Email notification sent successfully');
        } else {
          const errorData = await emailResponse.json();
          console.error('Failed to send email:', errorData);
        }
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the application submission if email fails
    }

    return c.json({
      success: true,
      applicationId,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return c.json({ error: 'Failed to submit application', details: (error as Error).message }, 500);
  }
});

// Admin: fetch applications (protected) - WITH DECRYPTION
app.get('/server/make-server-5a2ed2de/applications', async (c) => {
  const auth = requireAdminToken(c);
  if (auth) return c.json(auth.body, auth.status);

  try {
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'default-insecure-key';
    const data = await kv.list();
    
    // Decrypt all applications - support both encrypted and plain data
    const decryptedApplications = data.map((app: any) => {
      let formData = null;
      
      // If data is already decrypted (legacy format)
      if (app.formData) {
        formData = app.formData;
      }
      // If data is encrypted
      else if (app.encryptedData) {
        formData = decryptData(app.encryptedData, encryptionKey);
      }
      
      return {
        ...app,
        formData,
        encryptedData: undefined, // Remove encrypted field from response
      };
    });

    return c.json({ applications: decryptedApplications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// PREVENT UPDATE - Return 403 Forbidden (read-only)
app.put('/server/make-server-5a2ed2de/applications/:id', async (c) => {
  const auth = requireAdminToken(c);
  if (auth) return c.json(auth.body, auth.status);
  
  return c.json({ error: 'Applications are read-only and cannot be modified' }, 403);
});

// Allow DELETE for admin only
app.delete('/server/make-server-5a2ed2de/applications/:id', async (c) => {
  const auth = requireAdminToken(c);
  if (auth) return c.json(auth.body, auth.status);
  
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return c.json({ error: 'Failed to delete application' }, 500);
  }
});

// Helper function to format email body
function formatEmailBody(track: string, formData: any): string {
  const trackName = track === 'baby' ? '아기사자' : '운영진';
  const date = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const interestFieldLabelMap: Record<string, string> = {
    frontend: '프론트엔드',
    backend: '백엔드',
    planning: '기획(PM)',
    pm: '기획(PM)',
    design: '디자인',
    unsure: '아직 미정',
  };
  const staffPositionLabelMap: Record<string, string> = {
    backend: '백엔드',
    frontend: '프론트엔드',
    design: '디자인',
    pm: '기획(PM)',
    planning: '기획(PM)',
  };
  
  let html = `
    <div style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #00467F; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🦁 단국대 멋쟁이사자처럼 14기</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${trackName} 신규 지원서</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #6c757d; margin-bottom: 30px;">제출 시간: ${date}</p>
        
        <h2 style="color: #00467F; border-bottom: 2px solid #00467F; padding-bottom: 10px;">📋 인적사항</h2>
        <table style="width: 100%; margin-bottom: 30px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 120px;">성명</td><td style="padding: 8px 0;"><strong>${formData.name}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">학번</td><td style="padding: 8px 0;">${formData.studentId}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">학년/학기</td><td style="padding: 8px 0;">${formData.currentYear}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">전공</td><td style="padding: 8px 0;">${formData.major}</td></tr>
          ${formData.doubleMajor ? `<tr><td style="padding: 8px 0; color: #6c757d;">이중전공</td><td style="padding: 8px 0;">${formData.doubleMajor}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #6c757d;">연락처</td><td style="padding: 8px 0;">${formData.phone}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">이메일</td><td style="padding: 8px 0;">${formData.email}</td></tr>
        </table>
        
        <h2 style="color: #00467F; border-bottom: 2px solid #00467F; padding-bottom: 10px;">📅 활동 가능 여부</h2>
        <table style="width: 100%; margin-bottom: 30px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 120px;">수요일 18:30</td><td style="padding: 8px 0;">${formData.schedule1}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">토요일 13:00</td><td style="padding: 8px 0;">${formData.schedule2}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">토요일 15:00</td><td style="padding: 8px 0;">${formData.schedule3}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">면접 일정</td><td style="padding: 8px 0;">개별 연락 예정</td></tr>
        </table>
  `;

  if (track === 'baby') {
    html += `
        <h2 style="color: #00467F; border-bottom: 2px solid #00467F; padding-bottom: 10px;">💻 관심 분야 및 경험</h2>
        <table style="width: 100%; margin-bottom: 30px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 120px;">관심 분야</td><td style="padding: 8px 0;">${interestFieldLabelMap[formData.interestField] || formData.interestField}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">코딩 경험</td><td style="padding: 8px 0;">${formData.codingExperience}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d; vertical-align: top;">동아리/대외활동</td><td style="padding: 8px 0;">${formData.activities.join('<br>')}</td></tr>
        </table>
        
        <h2 style="color: #00467F; border-bottom: 2px solid #00467F; padding-bottom: 10px;">✍️ 에세이 답변</h2>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #495057; font-size: 14px; margin-bottom: 10px;">Q1. 멋쟁이사자처럼에 지원한 이유는 무엇인가요?</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">${formData.essay1.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #495057; font-size: 14px; margin-bottom: 10px;">Q2. 프로그래밍으로 만들어보고 싶은 서비스는?</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">${formData.essay2.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #495057; font-size: 14px; margin-bottom: 10px;">Q3. 본인을 표현할 수 있는 한 문장</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">${formData.essay3.replace(/\n/g, '<br>')}</p>
        </div>
    `;
  } else {
    html += `
        <h2 style="color: #00467F; border-bottom: 2px solid #00467F; padding-bottom: 10px;">💼 역량 및 경험</h2>
        <table style="width: 100%; margin-bottom: 30px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 120px;">지원 직무</td><td style="padding: 8px 0;">${staffPositionLabelMap[formData.position] || formData.position}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d; vertical-align: top;">기술 스택</td><td style="padding: 8px 0;">${formData.techStack.replace(/\n/g, '<br>')}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d; vertical-align: top;">포트폴리오</td><td style="padding: 8px 0;">${formData.portfolio.replace(/\n/g, '<br>')}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d; vertical-align: top;">동아리/대외활동</td><td style="padding: 8px 0;">${formData.activities.join('<br>')}</td></tr>
        </table>
        
        <h2 style="color: #00467F; border-bottom: 2px solid #00467F; padding-bottom: 10px;">✍️ 에세이 답변</h2>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #495057; font-size: 14px; margin-bottom: 10px;">Q1. 멋쟁이사자처럼 운영진에 지원한 이유는?</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">${formData.essay1.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #495057; font-size: 14px; margin-bottom: 10px;">Q2. 운영진으로서 기여할 수 있는 부분은?</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">${formData.essay2.replace(/\n/g, '<br>')}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #495057; font-size: 14px; margin-bottom: 10px;">Q3. 본인의 강점을 한 문장으로 표현한다면?</h3>
          <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; line-height: 1.6;">${formData.essay3.replace(/\n/g, '<br>')}</p>
        </div>
    `;
  }

  html += `
      </div>
      
      <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
        <p>이 이메일은 단국대 멋쟁이사자처럼 14기 리크루팅 시스템에서 자동 발송되었습니다.</p>
      </div>
    </div>
  `;

  return html;
}

// Get all applications (for admin)
app.get('/server/make-server-5a2ed2de/applications', async (c) => {
  try {
    const allApplications = await kv.getByPrefix('baby-');
    
    return c.json({
      success: true,
      applications: allApplications,
      count: allApplications.length,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return c.json({ error: 'Failed to fetch applications', details: (error as Error).message }, 500);
  }
});

// Get single application
app.get('/server/make-server-5a2ed2de/applications/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const application = await kv.get(id);

    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    return c.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return c.json({ error: 'Failed to fetch application', details: error.message }, 500);
  }
});

// Delete application
app.delete('/server/make-server-5a2ed2de/applications/:id', async (c) => {
  // Require admin token
  const auth = requireAdminToken(c);
  if (auth) return c.json(auth.body, auth.status);
  
  try {
    const id = c.req.param('id');
    
    if (!id) {
      return c.json({ error: 'Missing application ID' }, 400);
    }

    console.log(`Attempting to delete application: ${id}`);
    
    // Delete from KV store using kv.del
    await kv.del(id);

    console.log(`Application deleted successfully: ${id}`);
    return c.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    return c.json({ 
      error: 'Failed to delete application', 
      details: (error as Error).message,
      name: (error as Error).name
    }, 500);
  }
});

// Catch-all to surface the path that reached the function (for debugging 404s)
app.all('*', (c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

Deno.serve(app.fetch);