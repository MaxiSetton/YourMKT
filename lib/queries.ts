import { createClient } from '@/lib/supabase/server'
import type {
  Business,
  Campaign,
  Post,
  Metric,
  BaselineMetric,
} from '@/lib/types'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getBusiness(): Promise<Business | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data
}

export async function getCampaigns(businessId: string): Promise<Campaign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data
}

export async function getPostsForCampaign(campaignId: string): Promise<Post[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('fecha', { ascending: true })
  return data ?? []
}

export async function getAllPosts(
  campaignIds: string[],
): Promise<Post[]> {
  if (campaignIds.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .in('campaign_id', campaignIds)
    .order('fecha', { ascending: true })
  return data ?? []
}

export async function getMetrics(postIds: string[]): Promise<Metric[]> {
  if (postIds.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('metrics')
    .select('*')
    .in('post_id', postIds)
  return data ?? []
}

export async function getBaselineMetrics(
  businessId: string,
): Promise<BaselineMetric[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('baseline_metrics')
    .select('*')
    .eq('business_id', businessId)
    .order('fecha', { ascending: true })
  return data ?? []
}
