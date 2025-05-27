

import {
  Context,
  User,
  CreateConversationInput,
  SendMessageInput,
  ResolverContext,
  ConversationDocument,
  MessageDocument,
  DBUser
} from './types.js';
import { pool } from './postgres-pool.js';



export const getUserFromDatabase = async (email: string): Promise<User | null> => {
  try {
    const result = await pool.query<DBUser>(
      `SELECT 
        id,
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone_number as "phoneNumber",
        archived,
        scope
       FROM users 
       WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.email, // Using email as ID for consistency
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
      archived: row.archived
    };
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

                const searchResult = await pool.query<DBUser>(
                    `SELECT 
                        id,
                        first_name as "firstName",
                        last_name as "lastName",
                        email,
                        phone_number as "phoneNumber",
                        archived,
                        scope
                     FROM users 
                     WHERE email != $1 
                       AND (
                         LOWER(first_name) LIKE LOWER($2) 
                         OR LOWER(last_name) LIKE LOWER($2) 
                         OR LOWER(email) LIKE LOWER($2)
                       )
                       AND archived = false`,
                    [user.email, `%${query}%`]
                );

                return searchResult.rows.map((row: DBUser) => ({
                    id: row.email, // Using email as ID for consistency with the existing system
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                    phoneNumber: row.phoneNumber,
                    archived: row.archived
                }));
            } catch (error) {
                console.error('Error searching users:', error);
                return [];
            }
        }
    },



}; 