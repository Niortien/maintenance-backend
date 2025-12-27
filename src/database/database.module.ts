import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
    providers: [PrismaService],
    controllers: [],
    exports: [PrismaService]
})
export class DatabaseModule { }