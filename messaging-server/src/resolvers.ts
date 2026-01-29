import prisma from "prisma-orm"

import { User, ResolverContext } from './types.js';
//import { pool } from './postgres-pool.js';

export const getUserFromDatabase = async (email: string): Promise<User | null> => {
  try {
    const result = await prisma.user.findFirst({
      where: { email: email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        archived: true,
        scope: true
      }
    })

    if (!result) {
      return null;
    }

    return {
      id: result.email,
      ...result,
    }
    // return {
    //   id: row.email, // Using email as ID for consistency
    //   firstName: row.firstName,
    //   lastName: row.lastName,
    //   email: row.email,
    //   phoneNumber: row.phoneNumber,
    //   archived: row.archived
    // };
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
};

export const resolvers = {
  Query: {
    searchUsers: async (
      _: unknown,
      { query }: { query: string },
      { user }: ResolverContext
    ) => {
      try {
        console.log('Searching users with query:', query);
        console.log('Current user:', user?.email);

        if (!user?.email) {
          throw new Error('User not authenticated');
        }

        // const searchResult = await pool.query<DBUser>(
        //   `SELECT 
        //                 id,
        //                 first_name as "firstName",
        //                 last_name as "lastName",
        //                 email,
        //                 phone_number as "phoneNumber",
        //                 archived,
        //                 scope
        //              FROM users 
        //              WHERE email != $1 
        //                AND (
        //                  LOWER(first_name) LIKE LOWER($2) 
        //                  OR LOWER(last_name) LIKE LOWER($2) 
        //                  OR LOWER(email) LIKE LOWER($2)
        //                )
        //                AND archived = false`,
        //   [user.email, `%${query}%`]
        // );

        const searchResult = await prisma.user.findMany({
          where: {
            email: { not: user.email },
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ],
            archived: false
          },
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            archived: true,
          }
        })

        return searchResult.map((row: any) => ({
          id: row.email, // Using email as ID for consistency with the existing system
          ...row
        }));
      } catch (error) {
        console.error('Error searching users:', error);
        return [];
      }
    }
  },
};
