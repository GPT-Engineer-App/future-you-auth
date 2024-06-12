import { useState } from "react";
import { Container, Input, Button, VStack, Text, Box } from "@chakra-ui/react";
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
    <Box
      bgImage="url('/images/logo-background.png')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      opacity="0.1"
      position="absolute"
      width="100%"
      height="100%"
    >
      <Container centerContent>
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
    </Box>
  );
};

export default Login;