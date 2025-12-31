const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!projectId || !publicAnonKey) {
	console.error(
		"Missing Supabase env vars: VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_ANON_KEY",
	);
}

export { projectId, publicAnonKey };