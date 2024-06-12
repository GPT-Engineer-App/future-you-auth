import { useState } from "react";
import { Container, Input, Button, VStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      alert("Invalid email or password.");
    }
  };

  return (
    <Container centerContent>
      <VStack spacing={4}>
        <Text fontSize="2xl">Log In</Text>
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
        <Button onClick={handleLogin}>Log In</Button>
        <Text onClick={() => navigate("/signup")} cursor="pointer" color="blue.500">
          Sign Up
        </Text>
      </VStack>
    </Container>
  );
};

export default Login;