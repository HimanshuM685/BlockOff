import React, { useState } from 'react';
import { useLogs } from '@/contexts/logContext';
import LogWindow from './LogWindow';
import LogToggleButton from './LogToggleButton';

const LogWindowContainer: React.FC = () => {
  const [logWindowVisible, setLogWindowVisible] = useState(false);
  const { logs } = useLogs();

  return (
    <>
      <LogToggleButton
        onPress={() => setLogWindowVisible(true)}
        logCount={logs.length}
      />
      <LogWindow
        visible={logWindowVisible}
        onClose={() => setLogWindowVisible(false)}
      />
    </>
  );
};

export default LogWindowContainer;

