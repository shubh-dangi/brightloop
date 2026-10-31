import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { CustomersController } from "./customers.controller";
import { ActivityController } from "./activity.controller";

@Module({
  controllers: [UsersController, CustomersController, ActivityController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
