const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // 1. Create categories
  const categoriesData = [
    { name: 'Action' },
    { name: 'Romance' },
    { name: 'Isekai & Fantasy' },
    { name: 'Historical' }
  ];

  console.log('Creating categories...');
  const categories = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name }
    });
    categories[cat.name] = createdCat;
    console.log(`- Category: ${cat.name} (ID: ${createdCat.id})`);
  }

  // 2. Create the Blog Post (BlogPost)
  console.log('Creating BlogPost...');
  const actionCategory = categories['Action'];
  if (!actionCategory) {
    throw new Error('Action category not found in created categories');
  }

  const blogPost = await prisma.blogPost.upsert({
    where: { slug: 'best-action-manga' },
    update: {
      title: 'Best Action Manga',
      content: 'Uncover the highest rated action and battle systems available to read online.',
      description: 'A collection of high-octane battles, overpowered systems, and martial arts cultivation paths.',
      categoryId: actionCategory.id
    },
    create: {
      title: 'Best Action Manga',
      slug: 'best-action-manga',
      content: 'Uncover the highest rated action and battle systems available to read online.',
      description: 'A collection of high-octane battles, overpowered systems, and martial arts cultivation paths.',
      categoryId: actionCategory.id
    }
  });
  console.log(`- BlogPost: "${blogPost.title}" (ID: ${blogPost.id})`);

  // 3. Create the Blog Entry (BlogEntry)
  console.log('Creating BlogEntry...');
  const entryDescription = `Guts is a man shaped by endless battles and unimaginable suffering. Armed with a massive sword that towers over most weapons and a prosthetic arm hiding deadly surprises, he fights against enemies both human and monstrous. However, his greatest burden is the mysterious Brand of Sacrifice, a cursed mark that attracts terrifying creatures from the darkness and forces him into a never-ending battle for survival.

Unlike typical heroes, Guts is not fighting to save the world—he is fighting to reclaim his own life and take revenge against those who destroyed everything he cared about. His journey is filled with violence, loss, and difficult choices, exploring themes of ambition, friendship, trauma, and the struggle to overcome fate.

Alongside him travels Puck, a small elf whose humor and kindness provide a rare contrast to the darkness surrounding Guts. Together, they venture through a world where danger waits around every corner, and where survival itself is a constant challenge.

With its incredible artwork, deeply written characters, and unforgettable storytelling, Berserk is widely regarded as one of the greatest manga ever created. It is a dark and emotional journey that blends intense action with psychological depth, making it a must-read for fans looking for a mature and powerful fantasy experience.

Additional Notes:
- The first five volumes include the early prequel chapters (0A–0P).
- A special chapter titled “Berserk: The Prototype” is included in Volume 14.
- After the passing of creator Kentaro Miura, the manga continues with artwork by Studio Gaga and supervision by Kouji Mori from Chapter 365 onward.`;

  const blogEntry = await prisma.blogEntry.upsert({
    where: { id: 'berserk-entry-id-placeholder' }, // We will use a unique dummy search or handle it by findFirst
    update: {
      title: 'Berserk',
      slug: 'berserk.1087',
      content: entryDescription,
      description: entryDescription,
      imageUrl: 'https://mani-image-proxy.mehakiqbal974.workers.dev/?url=https%3A%2F%2Fmangakatana.com%2Fimgs%2Fcover%2F04e%2F06%2F73583.jpg',
      image: 'https://mani-image-proxy.mehakiqbal974.workers.dev/?url=https%3A%2F%2Fmangakatana.com%2Fimgs%2Fcover%2F04e%2F06%2F73583.jpg',
      genre: 'Action, Adventure, Drama, Fantasy, Horror, Psychological',
      blogPostId: blogPost.id
    },
    create: {
      title: 'Berserk',
      slug: 'berserk.1087',
      content: entryDescription,
      description: entryDescription,
      imageUrl: 'https://mani-image-proxy.mehakiqbal974.workers.dev/?url=https%3A%2F%2Fmangakatana.com%2Fimgs%2Fcover%2F04e%2F06%2F73583.jpg',
      image: 'https://mani-image-proxy.mehakiqbal974.workers.dev/?url=https%3A%2F%2Fmangakatana.com%2Fimgs%2Fcover%2F04e%2F06%2F73583.jpg',
      genre: 'Action, Adventure, Drama, Fantasy, Horror, Psychological',
      blogPostId: blogPost.id
    }
  });

  console.log(`- BlogEntry: "${blogEntry.title}" (ID: ${blogEntry.id})`);
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
