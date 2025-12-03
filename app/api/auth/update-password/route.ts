import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/utils/prisma-client";
import bcrypt from "bcrypt";
import { authOptions } from "@/utils/auth";

interface UpdatePasswordBody {
  currentPassword?: string;
  newPassword: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { currentPassword, newPassword } = req.body as UpdatePasswordBody;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters" });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const hasExistingPassword = !!user.password;

  if (hasExistingPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password!);
    if (!isValid) {
      return res.status(403).json({ error: "Current password is incorrect" });
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return res.status(200).json({ message: "Password updated successfully" });
}

// import { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth/next";
// import { prisma } from "@/utils/prisma-client";
// import bcrypt from "bcrypt";
// import { authOptions } from "@/utils/auth";

// interface UpdatePasswordBody {
//   currentPassword?: string;
//   newPassword: string;
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   const session = await getServerSession(req, res, authOptions);

//   if (!session || !session.user?.id) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const { currentPassword, newPassword } = req.body as UpdatePasswordBody;

//   if (!newPassword || newPassword.length < 6) {
//     return res
//       .status(400)
//       .json({ error: "New password must be at least 6 characters" });
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: session.user.id },
//   });

//   if (!user) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   // If user has an existing password, verify currentPassword
//   if (user.password) {
//     if (!currentPassword) {
//       return res.status(400).json({ error: "Current password is required" });
//     }

//     const isValid = await bcrypt.compare(currentPassword, user.password);
//     if (!isValid) {
//       return res.status(403).json({ error: "Current password is incorrect" });
//     }
//   }

//   const hashedPassword = await bcrypt.hash(newPassword, 10);

//   await prisma.user.update({
//     where: { id: user.id },
//     data: { password: hashedPassword },
//   });

//   return res.status(200).json({ message: "Password updated successfully" });
// }
