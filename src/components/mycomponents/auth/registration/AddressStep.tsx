import type { ChangeEventHandler } from "react";
import { Input } from "@/components/mycomponents/ui";
import { MapPin } from "lucide-react";

type AddressFields = {
    houseNo: string;
    country: string;
    state: string;
    city: string;
    street: string;
    pincode: string;
};

type AddressStepProps = {
    formDetails: AddressFields;
    updateField: (field: keyof AddressFields) => ChangeEventHandler<HTMLInputElement>;
    errors: Partial<Record<keyof AddressFields, string>>;
    inputClass?: string;
};

const AddressStep = ({ formDetails, updateField, errors, inputClass = "" }: AddressStepProps) => {
    return (
        <div>
            <div className="sm:col-span-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MapPin size={17} className="text-primary" /> Address (optional)
            </div>
            <br />
            <span className="grid  gap-5 sm:grid-cols-2 ">
                <Input label="House number" value={formDetails.houseNo} onChange={updateField("houseNo")} error={errors.houseNo} className={inputClass} />
                <Input label="Country" value={formDetails.country} onChange={updateField("country")} error={errors.country} className={inputClass} />
                <Input label="State" value={formDetails.state} onChange={updateField("state")} error={errors.state} className={inputClass} />
                <Input label="City" value={formDetails.city} onChange={updateField("city")} error={errors.city} className={inputClass} />
                <Input label="Street" value={formDetails.street} onChange={updateField("street")} error={errors.street} className={inputClass} />
                <Input label="Pincode" inputMode="numeric" maxLength={6} value={formDetails.pincode} onChange={updateField("pincode")} error={errors.pincode} className={inputClass} />
            </span>
        </div>
    );
};
export default AddressStep;