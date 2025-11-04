import { TimeSlot } from "@/utils/timeSlots";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  serviceDuration?: number;
}

export const TimeSlotSelector = ({
  slots,
  selectedTime,
  onSelectTime,
  serviceDuration
}: TimeSlotSelectorProps) => {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum horário disponível para esta data</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {serviceDuration && serviceDuration >= 60 && (
        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border/50">
          ⏱️ Este serviço ocupa {Math.ceil(serviceDuration / 30)} slots de 30 minutos
        </p>
      )}
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = !slot.isAvailable;
          
          return (
            <Button
              key={slot.time}
              type="button"
              variant={isSelected ? "default" : "outline"}
              disabled={isDisabled}
              onClick={() => onSelectTime(slot.time)}
              className={cn(
                "h-14 font-semibold text-base transition-all duration-300 relative",
                isSelected && "bg-accent text-accent-foreground shadow-glow scale-105 border-2 border-accent ring-2 ring-accent/20 ring-offset-2",
                isDisabled && "opacity-30 cursor-not-allowed",
                !isSelected && !isDisabled && "hover:border-accent hover:text-accent hover:scale-105 hover:shadow-md"
              )}
            >
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
              {slot.time}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
