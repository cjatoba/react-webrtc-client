import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export const Toast = ({ type = "success", message }) => {
  const [showToast, setShowToast] = useState(true);

  const successIcon = (
    <FontAwesomeIcon
      className="text-green-500"
      icon={["fas", "check-circle"]}
    />
  );
  const errorIcon = (
    <FontAwesomeIcon
      className="text-red-500"
      icon={["fas", "exclamation-triangle"]}
    />
  );
  const infoIcon = (
    <FontAwesomeIcon className="text-blue-500" icon={["fas", "info-circle"]} />
  );
  const warningIcon = (
    <FontAwesomeIcon
      className="text-yellow-500"
      icon={["fas", "exclamation-circle"]}
    />
  );

  const icon = {
    success: successIcon,
    error: errorIcon,
    info: infoIcon,
    warning: warningIcon,
  };

  const toastIcon = icon[type];

  const handleClose = () => {
    setShowToast(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  });

  if (!showToast) {
    return null;
  }

  return (
    <div
      id="toast"
      className="flex items-center fixed top-5 w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
      role="alert"
    >
      {toastIcon}
      <span className="sr-only">{`${type} icon`}</span>
      <section>
        <div className="ml-3 text-sm font-normal">{message}</div>
        <span className="sr-only">Close</span>
      </section>
      <div className="flex justify-end w-1/3">
        <FontAwesomeIcon icon={["fas", "xmark"]} onClick={handleClose} />
      </div>
    </div>
  );
};
