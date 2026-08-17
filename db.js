import { db } from './firebase-config.js';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, where, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// ---------- PERFIS ----------
const CONFIG_DOC = doc(db, 'config', 'perfis');

export async function carregarPerfis() {
  const snap = await getDoc(CONFIG_DOC);
  if (snap.exists()) return snap.data();
  const padrao = { p1: { nome: 'Pessoa 1' }, p2: { nome: 'Pessoa 2' } };
  await setDoc(CONFIG_DOC, padrao);
  return padrao;
}

export async function salvarNomePerfil(perfilId, nome) {
  await updateDoc(CONFIG_DOC, { [`${perfilId}.nome`]: nome });
}

// ---------- EXERCÍCIOS PERSONALIZADOS (catálogo compartilhado) ----------
export async function carregarExerciciosCustom() {
  const snap = await getDocs(collection(db, 'exercicios'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function salvarExercicioCustom(exercicio) {
  const ref = await addDoc(collection(db, 'exercicios'), exercicio);
  return ref.id;
}

export async function excluirExercicioCustom(id) {
  await deleteDoc(doc(db, 'exercicios', id));
}

// ---------- PLANOS SEMANAIS ----------
// planoId = `${perfilId}_${semanaId}`  ex: p1_semana1
export async function carregarPlano(perfilId, semanaId) {
  const ref = doc(db, 'planos', `${perfilId}_${semanaId}`);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return { perfilId, semanaId, nome: semanaId, dias: {} };
}

export async function salvarPlano(perfilId, semanaId, dados) {
  const ref = doc(db, 'planos', `${perfilId}_${semanaId}`);
  await setDoc(ref, { perfilId, semanaId, ...dados }, { merge: true });
}

export async function listarSemanas(perfilId) {
  const q = query(collection(db, 'planos'), where('perfilId', '==', perfilId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ---------- REGISTROS DE TREINO (logs) ----------
export async function registrarLog(log) {
  const ref = await addDoc(collection(db, 'logs'), {
    ...log,
    criadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function carregarLogsPorPerfil(perfilId, limiteDias = 60) {
  const q = query(
    collection(db, 'logs'),
    where('perfilId', '==', perfilId),
    orderBy('data', 'desc')
  );
  const snap = await getDocs(q);
  const hoje = new Date();
  const limite = new Date(hoje.getTime() - limiteDias * 24 * 60 * 60 * 1000);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(l => new Date(l.data) >= limite);
}

export async function excluirLog(id) {
  await deleteDoc(doc(db, 'logs', id));
}
