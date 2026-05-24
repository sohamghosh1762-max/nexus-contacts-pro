import NexusLogin from "./pages/NexusLogin";

import NexusContactsPro from "./pages/NexusContactsPro";

import {
  useAuth,
} from "./context/AuthContext";

function App() {

  const { user } = useAuth();

  return (
    <>
      {user ? (
        <NexusContactsPro />
      ) : (
        <NexusLogin />
      )}
    </>
  );
}

export default App;