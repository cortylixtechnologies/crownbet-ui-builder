import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LoadCode = () => {
  const [code, setCode] = useState("");
  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground">Load a Bet Code</h1>
        <p className="text-muted-foreground text-sm mt-1">Enter a booking code to load it into your betslip.</p>
        <div className="mt-6 space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 5HNXKE"
            className="h-12 text-lg font-bold tracking-widest text-center"
          />
          <Button
            onClick={() => code ? toast.success(`Loading ${code}…`) : toast.error("Enter a code")}
            className="w-full bg-gradient-primary text-primary-foreground font-bold h-11"
          >
            Load Code
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoadCode;
