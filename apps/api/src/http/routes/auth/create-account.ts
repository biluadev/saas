import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { hash } from "bcryptjs";

export async function createAccount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/users',
        {
            schema: {
                tags: ['auth'],
                summary: 'Create an account',
                body: z.object({
                    name: z.string(),
                    email: z.string(),
                    password: z.string().min(6)
                }),
            },
        },
        async (request, reply) => {
            const { name, email, password } = request.body

            const userWithSameEmail = await prisma.user.findUnique({
                where: { email },
            })

            if (userWithSameEmail) {
                return reply 
                    .status(400)
                    .send({ message: 'Email already exists'})
            }

            const [, domain] = email.split('@')

            const autoJoinOrganization = await prisma.organization.findFirst({
                where: {
                    domain,
                    shouldAttachUsersByDomain: true,
                }
            })

            const passwordHash = await hash(password, 6)

            await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    member_on: autoJoinOrganization ? {
                        create: {
                            organizationId: autoJoinOrganization.id,
                        }
                    }
                    : undefined,
                },
            })

            return reply.status(201).send()
        },
    )
}