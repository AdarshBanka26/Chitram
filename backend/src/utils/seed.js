/* Seed the database with demo users, works and boards.
   Usage: npm run seed   (requires a working MONGODB_URI in .env) */
import mongoose from 'mongoose';
import env, { assertRequiredEnv } from '../config/env.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Work from '../models/Work.js';
import Board from '../models/Board.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

const run = async () => {
  assertRequiredEnv();
  await connectDB();

  console.log('[seed] clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Work.deleteMany({}),
    Board.deleteMany({}),
    Comment.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  console.log('[seed] creating users...');
  const [archivist, painter, poet] = await User.create([
    { name: 'Grand Archivist', username: 'archivist', email: 'archivist@chitram.dev', password: 'Password123', role: 'admin', preferences: ['art', 'photography'] },
    { name: 'Mira Vale', username: 'mira', email: 'mira@chitram.dev', password: 'Password123', preferences: ['art', 'design'] },
    { name: 'Theo Quill', username: 'theo', email: 'theo@chitram.dev', password: 'Password123', preferences: ['writing'] },
  ]);

  console.log('[seed] creating works...');
  const works = await Work.create([
    { title: 'Torchlit Acrobat', description: 'A daring leap captured mid-air.', type: 'image', category: 'photography', mediaUrl: 'https://picsum.photos/seed/acrobat/800/600', thumbnailUrl: 'https://picsum.photos/seed/acrobat/400/300', owner: painter._id, tags: ['circus', 'motion', 'dramatic'] },
    { title: 'The Vanishing Tent', description: 'Watercolor study of fading wonder.', type: 'image', category: 'art', mediaUrl: 'https://picsum.photos/seed/tent/800/600', thumbnailUrl: 'https://picsum.photos/seed/tent/400/300', owner: mira._id ?? painter._id, tags: ['watercolor', 'circus', 'dreamy'] },
    { title: 'Ode to a Fleeting Act', type: 'writing', category: 'writing', textContent: 'Under flickering torchlight, the wonder lived for one breath, then was gone...', owner: poet._id, tags: ['poem', 'circus'] },
  ].filter(Boolean));

  console.log('[seed] creating board...');
  const board = await Board.create({
    name: 'Gallery of Wonders',
    description: 'The timeless stage of legendary acts.',
    owner: archivist._id,
    isCollaborative: true,
    collaborators: [painter._id],
    works: works.map((w) => w._id),
    coverImage: works[0].thumbnailUrl,
  });

  console.log('[seed] creating engagement...');
  await Comment.create({ work: works[0]._id, author: poet._id, text: 'Breathtaking timing!' });
  await Activity.create([
    { type: 'view', work: works[0]._id, user: poet._id },
    { type: 'like', work: works[0]._id, user: poet._id },
    { type: 'save', work: works[0]._id, user: archivist._id },
  ]);
  works[0].likes.push(poet._id);
  works[0].savedBy.push(archivist._id);
  works[0].viewCount = 12;
  await works[0].save();

  console.log('\n[seed] Done. Demo login -> email: mira@chitram.dev  password: Password123');
  console.log(`[seed] Board id: ${board._id}`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
