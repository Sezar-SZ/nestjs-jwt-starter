import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import * as cookieParser from "cookie-parser";
import { execSync } from "child_process";

describe("E2E JWT Sample", () => {
    let app: INestApplication;

    beforeAll(async () => {
        // TODO: launch test database before running tests
        // execSync(
        //     "docker compose down && docker-compose -f docker-compose.test.yml up -d"
        // );

        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        app.use(cookieParser("secret"));
        await app.init();
    });

    it("login as admin and access protected route", async () => {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error(
                "Environment variables ADMIN_EMAIL and ADMIN_PASSWORD must be set"
            );
        }

        const loginReq = await request(app.getHttpServer())
            .post("/auth/login")
            .send({ email: adminEmail, password: adminPassword })
            .expect(200);

        const token = loginReq.body.accessToken;

        await request(app.getHttpServer())
            .get("/auth")
            .set("Authorization", "Bearer " + token)
            .expect(200)
            .expect(({ body }) => {
                expect(body.email).toEqual(adminEmail);
            });

        return request(app.getHttpServer())
            .delete("/auth")
            .set("Authorization", "Bearer " + token)
            .expect(200)
            .expect(({ body }) => {
                expect(body.message).toEqual(
                    "protected route, only for user with admin role!"
                );
            });
    });

    it("login as non-admin and get error for protected route", async () => {
        const email = "testuser@test.com";
        const password = "testpassword";

        const loginReq = await request(app.getHttpServer())
            .post("/auth/login")
            .send({ email, password })
            .expect(200);

        const token = loginReq.body.accessToken;

        await request(app.getHttpServer())
            .get("/auth")
            .set("Authorization", "Bearer " + token)
            .expect(200)
            .expect(({ body }) => {
                expect(body.email).toEqual(email);
            });

        return request(app.getHttpServer())
            .delete("/auth")
            .set("Authorization", "Bearer " + token)
            .expect(403);
    });

    afterAll(async () => {
        // execSync("docker-compose -f docker-compose.test.yml down");
        await app.close();
    });
});
