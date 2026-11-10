import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  AuthenticatedUserRequest,
  OptionalUserJwtGuard,
  UserJwtGuard,
} from '../user-auth/guards/user-jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalUserJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Req() req: { user?: AuthenticatedUserRequest | null },
    @Body() dto: CreateOrderDto,
  ) {
    const userId = req.user?.userId || null;
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  @UseGuards(UserJwtGuard)
  async getMyOrders(@Req() req: { user: AuthenticatedUserRequest }) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Get(':id')
  async getOrderById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ordersService.getOrderById(id);
  }
}
