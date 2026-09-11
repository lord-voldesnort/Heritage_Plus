import { pool } from '../db/pool.js';

export async function generateNextCaseId(stateCode: string = 'MH'): Promise<string> {
  const year = new Date().getFullYear();
  const result = await pool.query<{ nextval: string }>('SELECT nextval($1) AS nextval', ['case_id_seq']);
  const seq = Number(result.rows[0].nextval);
  const sequenceStr = String(seq).padStart(4, '0');
  return `HP-${stateCode.toUpperCase()}-${year}-${sequenceStr}`;
}
