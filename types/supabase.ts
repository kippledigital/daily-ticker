export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      briefs: {
        Row: {
          id: string
          date: string
          subject: string
          html_content: string
          tldr: string | null
          actionable_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          subject: string
          html_content: string
          tldr?: string | null
          actionable_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          subject?: string
          html_content?: string
          tldr?: string | null
          actionable_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      stocks: {
        Row: {
          id: string
          brief_id: string
          ticker: string
          sector: string
          confidence: number
          risk_level: string
          action: string
          entry_price: number
          entry_zone_low: number | null
          entry_zone_high: number | null
          summary: string
          why_matters: string
          momentum_check: string
          actionable_insight: string
          allocation: string | null
          caution_notes: string | null
          learning_moment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brief_id: string
          ticker: string
          sector: string
          confidence: number
          risk_level: string
          action: string
          entry_price: number
          entry_zone_low?: number | null
          entry_zone_high?: number | null
          summary: string
          why_matters: string
          momentum_check: string
          actionable_insight: string
          allocation?: string | null
          caution_notes?: string | null
          learning_moment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brief_id?: string
          ticker?: string
          sector?: string
          confidence?: number
          risk_level?: string
          action?: string
          entry_price?: number
          entry_zone_low?: number | null
          entry_zone_high?: number | null
          summary?: string
          why_matters?: string
          momentum_check?: string
          actionable_insight?: string
          allocation?: string | null
          caution_notes?: string | null
          learning_moment?: string | null
          created_at?: string
        }
      }
    }
  }
}
