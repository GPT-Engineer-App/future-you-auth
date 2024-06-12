import { useState } from "react";
import logoBackground from "../assets/logo-background.png";
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
    <Container centerContent style={{ backgroundImage: `url(${logoBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.1 }}>
      <VStack spacing={4}>
        <Text fontSize="2xl" color="brand.900">Log In</Text>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        bg="brand.50"
          borderColor="brand.300"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        bg="brand.50"
          borderColor="brand.300"
        />
        <Button onClick={handleLogin} bg="brand.700" color="white">Log In</Button>
        <Text onClick={() => navigate("/signup")} cursor="pointer" color="accent.700">
          Sign Up
        </Text>
      </VStack>
    </Container>
  );
};

export default Login;