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
  UserJwtGuard,
} from '../user-auth/guards/user-jwt.guard';

@Controller('orders')
@UseGuards(UserJwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Req() req: { user: AuthenticatedUserRequest },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.userId, dto);
  }

  @Get()
  async getMyOrders(@Req() req: { user: AuthenticatedUserRequest }) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Get('my')
  async getMyOrdersAlias(@Req() req: { user: AuthenticatedUserRequest }) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Get(':id')
  async getOrderById(
    @Req() req: { user: AuthenticatedUserRequest },
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.ordersService.getOrderById(id, req.user.userId);
  }
}
