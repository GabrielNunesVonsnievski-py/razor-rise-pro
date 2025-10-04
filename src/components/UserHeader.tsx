import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserHeader() {
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || "");
        
        // Buscar nome do usuário na tabela profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      }
    };

    fetchUserData();
  }, []);

  const displayName = userName || userEmail;
  const initials = userName 
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail[0]?.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gradient-accent text-accent-foreground text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-foreground hidden sm:inline">
        {displayName}
      </span>
    </div>
  );
}
