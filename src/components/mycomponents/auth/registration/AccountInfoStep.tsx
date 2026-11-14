
import { Input } from "@/components/mycomponents/ui";
import type{ AccountInfoStepProps } from "@/types/types";



const AccountInfoStep = ({ formDetails, updateField, errors, inputClass = "" }: AccountInfoStepProps) => {
    return (
        <div className="grid gap-5 sm:grid-cols-1">
            <Input label="First name" placeholder="First name" value={formDetails.firstName} onChange={updateField("firstName")} error={errors.firstName} className={inputClass} />
            <Input label="Last name" placeholder="Last name" value={formDetails.lastName} onChange={updateField("lastName")} error={errors.lastName} className={inputClass} />
            <Input label="Username" placeholder="Username" autoComplete="username" value={formDetails.username} onChange={updateField("username")} error={errors.username} className={inputClass} />
            <Input label="Email address" placeholder="Email address" type="email" autoComplete="email" value={formDetails.email} onChange={updateField("email")} error={errors.email} className={inputClass} />
            <Input label="Contact number" placeholder="Contact number" type="tel" value={formDetails.phone} onChange={updateField("phone")} error={errors.phone} className={inputClass} />
        </div>
    );
};
export default AccountInfoStep;