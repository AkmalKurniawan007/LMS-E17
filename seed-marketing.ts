import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const initialSections = [
  { section_key: 'trust_bar', label: 'Partner/Trust Bar', data: { headline: 'Dipercaya oleh 1.200+ pelajar dari institusi & perusahaan terkemuka' } },
  { section_key: 'use_cases', label: 'Untuk Siapa Course Ini?', data: { headline: 'Untuk Siapa E17 Course?', subheadline: 'Materi kami dirancang secara fleksibel dan komprehensif, cocok untuk siapapun yang ingin beradaptasi dengan kebutuhan industri saat ini.' } },
  { section_key: 'feature_showcase', label: 'Fitur Unggulan', data: { headline: 'Satu platform untuk semua kebutuhan belajar Anda.', subheadline: 'Kami membangun sistem yang membuat proses belajar dari nol hingga mahir menjadi jauh lebih efektif, tanpa perlu berganti-ganti aplikasi.' } },
  { section_key: 'testimonials', label: 'Testimoni Siswa', data: { headline: 'Cerita Sukses\nAlumni E17 Course.', subheadline: 'Jangan hanya dengar dari kami. Lihat apa yang dikatakan oleh mereka yang telah membuktikan sendiri.' } },
  { section_key: 'faq', label: 'FAQ', data: { headline: 'Sebelum daftar,<br className=\"md:hidden\" /> mungkin Anda bertanya...', subheadline: 'Ini pertanyaan yang paling sering kami dengar dari calon peserta.' } },
  { section_key: 'final_cta', label: 'Call To Action Akhir', data: { headline: 'Masih ragu<br className=\"hidden md:block\"/> mau mulai dari mana?', subheadline: 'Konsultasi gratis dulu lewat WhatsApp, atau langsung lihat program yang paling cocok untuk Anda.', cta_primary_text: 'Pilih Program Anda', cta_secondary_text: 'Tanya via WhatsApp' } }
];

async function seed() {
  for (const section of initialSections) {
    const { data: existing } = await supabase.from('marketing_content').select('section_key').eq('section_key', section.section_key).single()
    if (!existing) {
      const { error } = await supabase.from('marketing_content').insert({
        section_key: section.section_key,
        label: section.label,
        data: section.data
      })
      if (error) {
        console.error(`Error inserting ${section.section_key}:`, error)
      } else {
        console.log(`Inserted ${section.section_key}`)
      }
    } else {
      console.log(`Section ${section.section_key} already exists`)
    }
  }
}

seed().catch(console.error)
