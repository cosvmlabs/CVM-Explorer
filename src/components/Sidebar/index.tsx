import React, { ReactNode, useEffect, useState } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Button,
  Heading,
  Tooltip,
} from '@chakra-ui/react'

import { FiMenu } from 'react-icons/fi'
import {
  FaTwitter,
  FaFacebook,
  FaReddit,
  FaMedium,
  FaHome,
  FaCompass,
  FaStar,
  FaSlidersH,
  FaGithub,
} from 'react-icons/fa'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { selectSubsNewBlock, selectSubsTxEvent } from '@/store/streamSlice'
import { useSelector } from 'react-redux'
import { BsBoxSeamFill } from 'react-icons/bs'

interface LinkItemProps {
  name: string
  icon: IconType
  route: string
  isBlank?: boolean
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FaHome, route: '/' },
  { name: 'Blocks', icon: BsBoxSeamFill, route: '/blocks' },
  { name: 'Validators', icon: FaCompass, route: '/validators' },
  { name: 'Proposals', icon: FaStar, route: '/proposals' },
  { name: 'Parameters', icon: FaSlidersH, route: '/parameters' },
]
const RefLinkItems: Array<LinkItemProps> = [
  {
    name: 'CVM Explorer',
    icon: FaGithub,
    route: 'https://explorer.cosvm.net',
    isBlank: true,
  },
]

export default function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const subsNewBlock = useSelector(selectSubsNewBlock)
  const subsTxEvent = useSelector(selectSubsTxEvent)

  return (
    <Box
      bg={useColorModeValue('light-container', 'dark-container')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex flexDirection="column" h="full" justifyContent="space-between">
        <Box>
          <Flex
            h="20"
            alignItems="center"
            mx="8"
            justifyContent="space-between"
          >
            <Text fontSize="3xl" fontWeight="bold" color="light-theme">
              CVM
            </Text>
            <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
              Explorer
            </Text>

            <CloseButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onClose}
            />
          </Flex>
          {LinkItems.map((link) => (
            <NavItem key={link.name} icon={link.icon} route={link.route}>
              {link.name}
            </NavItem>
          ))}
          <Heading
            mt="6"
            p="4"
            mx="4"
            size={'xs'}
            textTransform="uppercase"
            textColor={useColorModeValue('gray.500', 'gray.100')}
            fontWeight="medium"
          >
            Links
          </Heading>
          {RefLinkItems.map((link) => (
            <NavItem
              key={link.name}
              icon={link.icon}
              route={link.route}
              isBlank={link.isBlank}
            >
              {link.name}
            </NavItem>
          ))}
        </Box>
        <Flex justifyContent="center" mb="4">
          <Link href="https://twitter.com/CosvmLabs" isExternal>
            <IconButton
              as={FaTwitter}
              aria-label="Twitter"
              fontSize="lg"
              colorScheme="gray"
              borderRadius="full"
              mr="2"
              _hover={{ color: useColorModeValue('light-theme', 'dark-theme') }}
            />
          </Link>
          <Link href="https://medium.com/@media.cosvm" isExternal>
            <IconButton
              as={FaMedium}
              aria-label="Medium"
              fontSize="lg"
              colorScheme="gray"
              borderRadius="full"
              mr="2"
              _hover={{ color: useColorModeValue('light-theme', 'dark-theme') }}
            />
          </Link>
          <Link
            href="https://www.facebook.com/people/CosVM/100094733726910/?mibextid=O4c6Bo"
            isExternal
          >
            <IconButton
              as={FaFacebook}
              aria-label="Facebook"
              fontSize="lg"
              colorScheme="gray"
              borderRadius="full"
              mr="2"
              _hover={{ color: useColorModeValue('light-theme', 'dark-theme') }}
            />
          </Link>
          <Link href="https://www.reddit.com/user/CosVM/" isExternal>
            <IconButton
              as={FaReddit}
              aria-label="Reddit"
              fontSize="lg"
              colorScheme="gray"
              borderRadius="full"
              mr="2"
              _hover={{ color: useColorModeValue('light-theme', 'dark-theme') }}
            />
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children: string | number
  route: string
  isBlank?: boolean
}
const NavItem = ({ icon, children, route, isBlank, ...rest }: NavItemProps) => {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    if (route === '/') {
      setIsSelected(router.route === route)
    } else {
      setIsSelected(router.route.includes(route))
    }
  }, [router])

  return (
    <Link
      as={NextLink}
      href={route}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      target={isBlank ? '_blank' : '_self'}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={
          isSelected
            ? useColorModeValue('light-theme', 'dark-theme')
            : 'transparent'
        }
        color={isSelected ? 'white' : useColorModeValue('black', 'white')}
        _hover={{
          color: isSelected
            ? 'white'
            : useColorModeValue('light-theme', 'dark-theme'),
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="17"
            _groupHover={{
              color: isSelected
                ? 'white'
                : useColorModeValue('light-theme', 'dark-theme'),
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('light-container', 'dark-container')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
        CVM Explorer
      </Text>
    </Flex>
  )
}
