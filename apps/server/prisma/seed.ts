import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { DEFAULT_PERMISSIONS } from "@haven/shared";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@haven.local" },
    update: {},
    create: {
      username: "alice",
      displayName: "Alice",
      email: "alice@haven.local",
      passwordHash,
      status: "online",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@haven.local" },
    update: {},
    create: {
      username: "bob",
      displayName: "Bob",
      email: "bob@haven.local",
      passwordHash,
      status: "online",
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@haven.local" },
    update: {},
    create: {
      username: "charlie",
      displayName: "Charlie",
      email: "charlie@haven.local",
      passwordHash,
      status: "idle",
    },
  });

  // Create a demo server
  const server = await prisma.server.create({
    data: {
      name: "Haven HQ",
      ownerId: alice.id,
      channels: {
        create: [
          { name: "general", type: "TEXT", position: 0 },
          { name: "random", type: "TEXT", position: 1 },
          { name: "dev", type: "TEXT", position: 2 },
          { name: "General", type: "VOICE", position: 3 },
          { name: "Gaming", type: "VOICE", position: 4 },
        ],
      },
      roles: {
        create: {
          name: "@everyone",
          permissions: DEFAULT_PERMISSIONS,
          position: 0,
        },
      },
    },
    include: { channels: true },
  });

  // Add members
  await prisma.member.createMany({
    data: [
      { userId: alice.id, serverId: server.id },
      { userId: bob.id, serverId: server.id },
      { userId: charlie.id, serverId: server.id },
    ],
    skipDuplicates: true,
  });

  // Add some messages to #general
  const generalChannel = server.channels.find((c) => c.name === "general" && c.type === "TEXT");
  if (generalChannel) {
    await prisma.message.createMany({
      data: [
        { content: "Welcome to Haven! 🎉", authorId: alice.id, channelId: generalChannel.id },
        { content: "Hey everyone!", authorId: bob.id, channelId: generalChannel.id },
        { content: "This is pretty cool", authorId: charlie.id, channelId: generalChannel.id },
        { content: "Finally, a Discord alternative without facial recognition", authorId: alice.id, channelId: generalChannel.id },
        { content: "And it's open source!", authorId: bob.id, channelId: generalChannel.id },
      ],
    });
  }

  // Create an invite
  await prisma.invite.create({
    data: {
      code: "havenhq",
      serverId: server.id,
    },
  });

  console.log("Seed complete!");
  console.log(`Demo server: ${server.name} (${server.id})`);
  console.log("Demo users: alice, bob, charlie (password: password123)");
  console.log("Invite code: havenhq");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
