import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { fastify } from "fastify";
import { 
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from "fastify-type-provider-zod";
import { createAccount } from "./routes/auth/create-account";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-passaword";
import { fastifyJwt } from "@fastify/jwt";
import { getProfile } from "./routes/auth/get-profile";
import { errorHandler } from "./error-handler";
import { requestPasswordRecover } from "./routes/auth/request-password-recover";
import { resetPassword } from "./routes/auth/reset-password";
import { authenticateWithGithub } from "./routes/auth/authenticate-with-github";
import { createOrganization } from "./routes/orgs/create-organization";
import { getMembership } from "./routes/orgs/get-membership";

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Next.js Saas',
        description: 'Full-stack Saas app with multi-tenant & RBAC',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }
        }
      }
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  })

app.register(fastifyJwt, {
  secret: 'my-jwt-secret'
})

app.register(fastifyCors)
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)
app.register(createOrganization)
app.register(getMembership)

app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!')
})