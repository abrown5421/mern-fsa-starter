import { Address } from "../../types/user.types";
import FormInput from "./FormInput";

interface AddressFormProps {
  prefix: string;
  address: Address;
  errors?: Partial<Record<keyof Address, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressForm = ({ prefix, address, errors, onChange }: AddressFormProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <FormInput
        name={`${prefix}.addrLine1`}
        value={address.addrLine1}
        onChange={onChange}
        placeholder="Address Line 1"
        error={errors?.addrLine1}
        className="md:col-span-2"
      />

      <FormInput
        name={`${prefix}.addrLine2`}
        value={address.addrLine2!}
        onChange={onChange}
        placeholder="Address Line 2"
        className="md:col-span-2"
      />

      <FormInput
        name={`${prefix}.addrCity`}
        value={address.addrCity}
        onChange={onChange}
        placeholder="City"
        error={errors?.addrCity}
      />

      <FormInput
        name={`${prefix}.addrState`}
        value={address.addrState}
        onChange={onChange}
        placeholder="State"
        error={errors?.addrState}
      />

      <FormInput
        name={`${prefix}.addrZip`}
        value={address.addrZip || ""}
        onChange={onChange}
        placeholder="Zip Code"
        error={errors?.addrZip}
        className="md:col-span-2"
      />
    </div>
  );
};

export default AddressForm;
