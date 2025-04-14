import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addHours, isAfter, isBefore } from 'date-fns';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async addPoint(userId: string): Promise<number> {
    const user = await this.prisma.userPoints.upsert({
      where: { userId },
      update: { points: { increment: 1 } },
      create: { userId, points: 1 },
    });
    return user.points;
  }

  async getPoints(userId: string): Promise<number> {
    const user = await this.prisma.userPoints.findUnique({
      where: { userId },
    });
    return user?.points || 0;
  }

  async spendPoints(userId: string, amount: number): Promise<number> {
    const user = await this.prisma.userPoints.findUnique({ where: { userId } });
    if (!user || user.points < amount) throw new Error('Not enough points');

    const updated = await this.prisma.userPoints.update({
      where: { userId },
      data: { points: { decrement: amount } },
    });

    return updated.points;
  }

  async claimDaily(userId: string): Promise<{ success: boolean; points?: number; retryIn?: number }> {
    const user = await this.prisma.userPoints.findUnique({ where: { userId } });

    const now = new Date();
    const cooldown = 24; // hours

    if (user?.lastDailyClaim && isAfter(now, user.lastDailyClaim)) {
      const nextAllowed = addHours(user.lastDailyClaim, cooldown);
      if (now < nextAllowed) {
        const retryInMs = nextAllowed.getTime() - now.getTime();
        return { success: false, retryIn: retryInMs };
      }
    }

    const updated = await this.prisma.userPoints.upsert({
      where: { userId },
      update: {
        points: { increment: 10 },
        lastDailyClaim: now,
      },
      create: {
        userId,
        points: 10,
        lastDailyClaim: now,
      },
    });

    return { success: true, points: updated.points };
  }

  async attemptSteal(attackerId: string, targetId: string): Promise<{ success: boolean, message: string, attackerPoints: number }> {
    if (attackerId === targetId) {
      return { success: false, message: "You can't rob yourself. That's just sad.", attackerPoints: 0 };
    }
  
    const [attacker, target] = await Promise.all([
      this.prisma.userPoints.findUnique({ where: { userId: attackerId } }),
      this.prisma.userPoints.findUnique({ where: { userId: targetId } }),
    ]);
  
    const now = new Date();
    const cooldown = 1; // hours
  
    // Check cooldown
    if (attacker?.lastStealAttempt && isBefore(now, addHours(attacker.lastStealAttempt, cooldown))) {
      const retryInMs = addHours(attacker.lastStealAttempt, cooldown).getTime() - now.getTime();
      const mins = Math.ceil(retryInMs / 60000);
      return { success: false, message: `🕒 You can steal again in ${mins} minutes.`, attackerPoints: attacker?.points || 0 };
    }
  
    if (!target || target.points < 1) {
      return { success: false, message: `❌ ${targetId} has no points to steal.`, attackerPoints: attacker?.points || 0 };
    }
  
    const success = Math.random() < 0.3;
  
    if (success) {
      // Steal success
      await this.prisma.$transaction([
        this.prisma.userPoints.update({
          where: { userId: attackerId },
          data: {
            points: { increment: 10 },
            lastStealAttempt: now,
          },
        }),
        this.prisma.userPoints.update({
          where: { userId: targetId },
          data: {
            points: { decrement: 10 },
          },
        }),
      ]);
  
      const updated = await this.prisma.userPoints.findUnique({ where: { userId: attackerId } });
  
      return {
        success: true,
        message: `💰 You successfully stole 10 points from <@${targetId}>!`,
        attackerPoints: updated?.points || 0,
      };
    } else {
      // Steal fail
      await this.prisma.$transaction([
        this.prisma.userPoints.update({
          where: { userId: attackerId },
          data: {
            points: { decrement: 5 },
            lastStealAttempt: now,
          },
        }),
        this.prisma.userPoints.update({
          where: { userId: targetId },
          data: {
            points: { increment: 3 },
          },
        }),
      ]);
  
      const updated = await this.prisma.userPoints.findUnique({ where: { userId: attackerId } });
  
      return {
        success: false,
        message: `💥 You failed to steal from <@${targetId}> and lost 5 points! They gained 3 for your efforts.`,
        attackerPoints: updated?.points || 0,
      };
    }
  }

  async coinflip(userId: string, amount: number): Promise<{ success: boolean; message: string; balance: number }> {
    const user = await this.prisma.userPoints.findUnique({ where: { userId } });
  
    if (!user || user.points < amount) {
      return {
        success: false,
        message: `❌ You don’t have enough points to bet ${amount}.`,
        balance: user?.points ?? 0,
      };
    }
  
    const win = Math.random() < 0.5;
  
    const updated = await this.prisma.userPoints.update({
      where: { userId },
      data: {
        points: {
          [win ? 'increment' : 'decrement']: amount,
        },
      },
    });
  
    const resultMessage = win
      ? `🎉 You won the coinflip and gained **${amount}** points!`
      : `💀 You lost the coinflip and lost **${amount}** points.`;
  
    return {
      success: true,
      message: resultMessage,
      balance: updated.points,
    };
  }

}