import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) env[key.trim()] = rest.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']; // using SERVICE ROLE KEY to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function initChatGroups() {
  console.log("Mulai menginisialisasi Grup Chat untuk Batch yang sudah ada...");

  // 1. Fetch all batches with their program names
  const { data: batches, error: batchesErr } = await supabase
    .from('batches')
    .select(`
      id,
      name,
      programs:program_id (name)
    `);

  if (batchesErr) {
    console.error("Gagal mengambil data batches:", batchesErr.message);
    return;
  }

  console.log(`Ditemukan ${batches.length} batch.`);

  for (const batch of batches) {
    const programName = batch.programs?.name || 'Program';
    const roomName = `${programName} - ${batch.name}`;

    // 2. Cek apakah room untuk batch ini sudah ada
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('batch_id', batch.id)
      .eq('type', 'group')
      .maybeSingle();

    let roomId = existingRoom?.id;

    if (!roomId) {
      console.log(`Membuat room untuk: ${roomName}`);
      const { data: newRoom, error: createErr } = await supabase
        .from('chat_rooms')
        .insert({
          type: 'group',
          name: roomName,
          batch_id: batch.id
        })
        .select('id')
        .single();

      if (createErr) {
        console.error(`Gagal membuat room ${roomName}:`, createErr.message);
        continue;
      }
      roomId = newRoom.id;
    } else {
      console.log(`Room untuk ${roomName} sudah ada (ID: ${roomId}).`);
    }

    // 3. Masukkan Siswa (Enrollments)
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('batch_id', batch.id);

    // 4. Masukkan Mentor
    const { data: mentors } = await supabase
      .from('batch_mentors')
      .select('mentor_id')
      .eq('batch_id', batch.id);

    const participants = [];
    if (enrollments) {
      enrollments.forEach(e => participants.push(e.user_id));
    }
    if (mentors) {
      mentors.forEach(m => participants.push(m.mentor_id));
    }

    // Hilangkan duplikat
    const uniqueParticipants = [...new Set(participants)];

    console.log(`- Mendaftarkan ${uniqueParticipants.length} partisipan ke grup...`);

    for (const userId of uniqueParticipants) {
      // Upsert participant
      const { error: partErr } = await supabase
        .from('chat_participants')
        .upsert({
          room_id: roomId,
          user_id: userId
        }, { onConflict: 'room_id,user_id' }); // Require unique constraint on (room_id, user_id). Since we made it PRIMARY KEY, it acts as unique.

      if (partErr) {
        console.error(`  -> Gagal mendaftarkan user ${userId}:`, partErr.message);
      }
    }
  }

  console.log("Inisialisasi selesai!");
}

initChatGroups();
