import {
  Text,
  Box,
  Grid,
  Flex,
  Image,
  Heading,
  GridItem,
  Divider,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import ape from "../assets/Bored-Ape-Yacht-Club-Adidas.jpg";
import crown from "../assets/il_fullxfull.2369143838_c055.jpg";
import { useMoralis } from "react-moralis";

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState("");
  const [hoursLeft, setHoursLeft] = useState("");
  const [minutesLeft, setMinutesLeft] = useState("");
  const [secondsLeft, setSecondsLeft] = useState("");
  const timerComponents = [];

  const calculateTimeLeft = () => {
    let year = new Date().getFullYear();
    let difference = +new Date(`02/08/${year}`) - +new Date();

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    setHoursLeft(timeLeft.hours);
    setMinutesLeft(timeLeft.minutes);
    setSecondsLeft(timeLeft.seconds);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <Flex h="94vh" justify="center">
      <Flex mt="5%" align="center" justify="center" w="70%" h="70%">
        <Grid templateColumns="repeat(2, 1fr)" gap={10}>
          <GridItem>
            <Image src={crown} />
          </GridItem>
          <GridItem>
            <Flex
              w="80%"
              h="100%"
              justify="space-between"
              flexDirection="column"
            >
              <Heading color="#3D76E0" size="3xl">
                Governance Token
              </Heading>
              <Flex justify="flex-end" h="40%" flexDirection="column">
                <Flex
                  justify="space-between"
                  align="flex-end"
                  flexDirection="row"
                >
                  <Box>
                    {" "}
                    <Text fontSize="large" color="#28ACEA" fontWeight="bold">
                      Current bid
                    </Text>
                    <Heading fontSize="5xl">0.00ETH</Heading>
                  </Box>
                  <Box ml="10px" bg="#28ACEA" w="1px" h="85px" />
                  <Flex
                    flexDirection="column"
                    justify="flex-start"
                    align="flex-start"
                  >
                    <Text fontSize="large" color="#28ACEA" fontWeight="bold">
                      Time Left
                    </Text>
                    <Flex w="100%">
                      <Text fontSize="4xl">{hoursLeft}:</Text>
                      <Text fontSize="4xl">{minutesLeft}:</Text>
                      <Text fontSize="4xl">{secondsLeft}</Text>
                    </Flex>
                  </Flex>
                </Flex>

                <Button mt="3%" bg="#3D76E0" _hover={{ bg: "#28ACEA" }}>
                  Bid
                </Button>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </Flex>
  );
}
