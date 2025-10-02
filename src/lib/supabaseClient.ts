import { createClient, Session } from "@supabase/supabase-js";
import { hashString, verifyHash } from "./utils";

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

export async function generateSignInCode(): Promise<{ id: number, code: number } | null> {
    try {
        const code = parseInt(`${Math.random() * 999}${new Date().getTime()}${Math.random() * 999}`, 10);

        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
            console.error(authError)
            return null
        }

        const user_id = session.user.id

        const hashedCode = await hashString(code.toString());

        const { data, error } = await supabase.from("sign_in_with_code").upsert({
            user_id,
            code: hashedCode,
            access_token: session.access_token,
            refresh_token: session.refresh_token
        }, {
            onConflict: 'user_id',
        }).select('*').maybeSingle();

        if (error) {
            console.error(error)
            return null
        }

        // if (!data || data.length === 0) {
        //     console.error('No sign in data found')
        //     return null
        // }

        if (!data) {
            console.error('No sign in data found')
            return null
        }

        return {
            id: data.id,
            code
        }
    } catch (error) {
        console.error(error)
        return null

    }
}


export async function signInWithCode(id: number, code: number): Promise<Session | null> {
    try {
        // Hash the code to match stored value
        const hashedCode = await hashString(code.toString())

        // Look up the code in the table
        console.log("searching for", id, hashedCode)
        const { data: signInData, error } = await supabase
            .from('sign_in_with_code')
            .select('created_at,user_id,code,access_token,refresh_token')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error(error)
            return null
        }

        if (!signInData) {
            console.error('No sign in data found')
            return null
        }

        if (await verifyHash(code.toString(), signInData.code)) {
            // Set session in Supabase auth
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: signInData.access_token,
                refresh_token: signInData.refresh_token
            })

            if (sessionError) {
                console.error('Failed to set session:', sessionError)
                return null
            }

            // ✅ Check that the user is authenticated
            const user = supabase.auth.getUser()
            if (!user) {
                console.error('User not authenticated after setting session')
                return null
            }


            const { data, error: userDataError } = await supabase.auth.getSession();

            if (userDataError || !data) {
                console.error(userDataError)
                return null
            }

            console.log("user data", data)

            return data.session

        } else {
            return null
        }
    } catch (err) {
        console.error(err)
        return null
    }
}
