import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { CustomersController } from "./customers.controller";

@Module({
  controllers: [UsersController, CustomersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

