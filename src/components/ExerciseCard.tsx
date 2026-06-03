import { Card } from "@/components/ui/card";
import { Exercise } from "@/data/mockData";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

export const ExerciseCard = ({ exercise, onClick }: ExerciseCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-primary/20 hover:border-primary/60"
    >
      {/* Background Image */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={exercise.image} 
          alt={exercise.nameVi}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
        
        {/* Hover Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-purple-600/20 transition-all duration-300" />
      </div>
      
      {/* Content Below Image */}
      <div className="p-6 text-center space-y-2 bg-card">
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {exercise.nameVi}
        </h3>
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
          {exercise.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {exercise.description}
        </p>
      </div>
    </Card>
  );
};
