import { useState } from "react";
import { Container, Input, Button, VStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("/signup", { name, email, password });
      navigate("/login");
    } catch (error) {
      alert("Email is already in use.");
    }
  };

  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="2xl">Sign Up</Text>
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSignup}>Sign Up</Button>
        <Text onClick={() => navigate("/login")} cursor="pointer" color="blue.500">
          Log In
        </Text>
      </VStack>
    </Container>
  );
};

export default Signup;