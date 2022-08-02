import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = getSession({ req });

  if (!session) {
    return res.status(401).json({
      message: "You are not logged in",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { listedHomes: true },
  });

  const { id } = req.query;
  if (!user?.listedHomes?.find((home) => home.id === id)) {
    return res.status(401).json({
      message: "You are not authorized to access this resource",
    });
  }
  // Update home
  if (req.method === "PATCH") {
    try {
      const home = await prisma.home.update({
        where: { id },
        data: req.body,
      });
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({
        message: "Error updating home",
      });
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
