import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js DNS srv resolution issues (e.g. ECONNREFUSED) by preferring IPv4 and public DNS
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if restricted
}

const DIRECT_REPLICA_FALLBACK =
  process.env.MONGODB_REPLICA_URI || process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or Vercel Environment Variables');
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    };

    console.log('\x1b[36m[MongoDB]\x1b[0m 🔄 Connexion à MongoDB Atlas en cours...');

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .catch(async (err: any) => {
        if (
          err.message &&
          (err.message.includes('querySrv') ||
            err.message.includes('ECONNREFUSED') ||
            err.message.includes('ENOTFOUND'))
        ) {
          console.warn('\x1b[33m[MongoDB] ⚠️ DNS SRV bloqué par le FAI/routeur local. Bascule automatique sur ReplicaSet direct...\x1b[0m');
          return mongoose.connect(DIRECT_REPLICA_FALLBACK, opts);
        }
        throw err;
      })
      .then((m) => {
        console.log(`\x1b[32m[MongoDB] ✅ CONNECTÉ AVEC SUCCÈS AU CLUSTER !\x1b[0m (Base: ${m.connection.name || 'stonelink'})`);
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error(`\x1b[31m[MongoDB] ❌ ÉCHEC DE CONNEXION :\x1b[0m ${e.message}`);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
