import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body = null, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      const { data } = await axios[method](url, body);

      if (onSuccess) onSuccess(data);
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <ul>
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
