import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PregnancyOrder } from "@/data/patients";

export interface NewMotherFormData {
  name: string;
  age: string;
  pregnancyOrder: PregnancyOrder;
  weekOfPregnancy: string;
}

interface AddNewMotherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewMotherFormData) => void;
}

const defaultForm: NewMotherFormData = {
  name: "",
  age: "",
  pregnancyOrder: "1st",
  weekOfPregnancy: "",
};

export function AddNewMotherDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddNewMotherDialogProps) {
  const [form, setForm] = useState<NewMotherFormData>(defaultForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.age.trim() || !form.weekOfPregnancy.trim()) return;
    onSubmit(form);
    setForm(defaultForm);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(defaultForm);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Mother</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mother-name">Name</Label>
            <Input
              id="mother-name"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother-age">Age</Label>
            <Input
              id="mother-age"
              type="number"
              min={15}
              max={50}
              placeholder="Age in years"
              value={form.age}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Pregnancy</Label>
            <RadioGroup
              value={form.pregnancyOrder}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, pregnancyOrder: v as PregnancyOrder }))
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1st" id="preg-1st" />
                <Label htmlFor="preg-1st" className="font-normal cursor-pointer">
                  1st
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2nd" id="preg-2nd" />
                <Label htmlFor="preg-2nd" className="font-normal cursor-pointer">
                  2nd
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3rd" id="preg-3rd" />
                <Label htmlFor="preg-3rd" className="font-normal cursor-pointer">
                  3rd
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother-week">Week of pregnancy</Label>
            <Input
              id="mother-week"
              type="number"
              min={1}
              max={42}
              placeholder="e.g. 32"
              value={form.weekOfPregnancy}
              onChange={(e) =>
                setForm((p) => ({ ...p, weekOfPregnancy: e.target.value }))
              }
              required
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Mother</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
