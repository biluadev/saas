import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { Role } from "@prisma/client";

import { auth } from "@/http/middlewares/auth";
import z from "zod";


export async function getMembership(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .register(auth)
        .get(
            '/organizations/:slug/membership',
            {
                schema: {
                    tags: ['organization'],
                    summary: 'Get user membership on organization',

                    params: z.object({
                        slug: z.string(),
                    }),

                    response: {
                        200: z.object({
                            membership: z.object({
                                id: z.string().uuid(),
                                role: z.nativeEnum(Role), // 🔥 Usa o enum do Prisma diretamente
                                organizationId: z.string().uuid(),
                            })
                        })
                    }                    
                    
                },
            },

            async (request) => {
                const { slug } = request.params
                const { membership } = await request.getUserMembership(slug)

                return {
                    membership: {
                        id: membership.id,
                        role: membership.role,
                        organizationId: membership.organizationId,
                    }
                }
            },
        )
}