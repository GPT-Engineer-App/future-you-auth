import { useState } from "react";
import { Container, Input, Button, VStack, Text, Box } from "@chakra-ui/react";
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
          <Text fontSize="2xl" color="brand.900">Sign Up</Text>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg="brand.50"
            borderColor="brand.300"
          />
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
          <Button onClick={handleSignup} bg="brand.700" color="white">Sign Up</Button>
          <Text onClick={() => navigate("/login")} cursor="pointer" color="accent.700">
            Log In
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Signup;