import { AnimatePresence, motion } from "framer-motion";
import { Address } from "../../types/user.types";
import AddressForm from "./AddressForm";

interface AddressBlockProps {
  mailingAddress: Address;
  billingAddress: Address;
  sameAddress: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    mailingAddress?: any;
    billingAddress?: any;
  };
}

const AddressBlock = ({
  mailingAddress,
  billingAddress,
  sameAddress,
  onChange,
  errors,
}: AddressBlockProps) => {
  return (
    <>
      <div className="bg-neutral3 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold font-primary">Mailing Address</h2>
        <AddressForm
          prefix="mailingAddress"
          address={mailingAddress}
          errors={errors?.mailingAddress}
          onChange={onChange}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="sameAddress"
            checked={sameAddress}
            onChange={onChange}
          />
          Billing address is the same as mailing
        </label>
      </div>

      <AnimatePresence initial={false}>
        {!sameAddress && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neutral3 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold font-primary">
                Billing Address
              </h2>
              <AddressForm
                prefix="billingAddress"
                address={billingAddress}
                errors={errors?.billingAddress}
                onChange={onChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddressBlock;
