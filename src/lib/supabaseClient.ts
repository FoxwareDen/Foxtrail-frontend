import { createClient, Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing supabase env variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Job {
    id: number,
    created_at: string,
    api_id: string | null,
    adref: string | null,
    title: string,
    listing_created_at: string | null,
    category: string | null,
    location: string | null,
    description: string | null,
    redirect_url: string | null,
    contract: string | null,
    company: string | null
}

export async function getSessionData(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.log(error)
        return null
    }


    return data.session
}

export async function setSessionData(accessToken: string, refreshToken: string): Promise<Session | null> {
    const { data, error } = await supabase.auth.setSession({
        access_token: accessToken, refresh_token: refreshToken
    })

    if (error) {
        console.log(error)
        return null
    }


    return data.session
}
