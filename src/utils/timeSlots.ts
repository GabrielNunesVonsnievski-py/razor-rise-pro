import dayjs, { Dayjs } from 'dayjs';

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  requiresMultipleSlots: number; // Quantos slots de 30min são necessários
}

/**
 * Gera slots de 30 minutos dentro de um intervalo de horário
 */
export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  intervalStart?: string,
  intervalEnd?: string
): string[] => {
  const slots: string[] = [];
  const start = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);
  
  let current = start;
  
  while (current.isBefore(end)) {
    const timeStr = current.format('HH:mm');
    
    // Verificar se está dentro do intervalo de almoço
    const isInInterval = intervalStart && intervalEnd &&
      timeStr >= intervalStart && timeStr < intervalEnd;
    
    if (!isInInterval) {
      slots.push(timeStr);
    }
    
    current = current.add(30, 'minute');
  }
  
  return slots;
};

/**
 * Calcula quantos slots de 30min são necessários para um serviço
 */
export const calculateRequiredSlots = (durationMinutes: number): number => {
  return Math.ceil(durationMinutes / 30);
};

/**
 * Verifica se há slots consecutivos disponíveis
 */
export const hasConsecutiveSlotsAvailable = (
  startSlotIndex: number,
  requiredSlots: number,
  availableSlots: string[],
  bookedTimes: string[]
): boolean => {
  for (let i = 0; i < requiredSlots; i++) {
    const slotIndex = startSlotIndex + i;
    if (slotIndex >= availableSlots.length) return false;
    
    const slot = availableSlots[slotIndex];
    if (bookedTimes.includes(slot)) return false;
  }
  
  return true;
};

/**
 * Retorna os slots que serão ocupados por um agendamento
 */
export const getOccupiedSlots = (
  startTime: string,
  durationMinutes: number,
  allSlots: string[]
): string[] => {
  const requiredSlots = calculateRequiredSlots(durationMinutes);
  const startIndex = allSlots.indexOf(startTime);
  
  if (startIndex === -1) return [];
  
  const occupied: string[] = [];
  for (let i = 0; i < requiredSlots; i++) {
    const slot = allSlots[startIndex + i];
    if (slot) occupied.push(slot);
  }
  
  return occupied;
};

/**
 * Filtra horários disponíveis considerando duração do serviço
 */
export const getAvailableTimeSlots = (
  allSlots: string[],
  bookedTimes: string[],
  serviceDuration: number
): TimeSlot[] => {
  const requiredSlots = calculateRequiredSlots(serviceDuration);
  
  return allSlots.map((time, index) => {
    const isAvailable = hasConsecutiveSlotsAvailable(
      index,
      requiredSlots,
      allSlots,
      bookedTimes
    );
    
    return {
      time,
      isAvailable,
      requiresMultipleSlots: requiredSlots
    };
  });
};
