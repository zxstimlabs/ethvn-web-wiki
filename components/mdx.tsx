import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { SectionCards } from '@/components/section-cards';
import { BlockAnatomy } from '@/components/iso/block-anatomy';
import { ByzantineScene } from '@/components/iso/byzantine-scene';
import { ChainScene } from '@/components/iso/chain-scene';
import { ConsensusScene } from '@/components/iso/consensus-scene';
import { ContractScene } from '@/components/iso/contract-scene';
import { GasScene } from '@/components/iso/gas-scene';
import { KeysScene } from '@/components/iso/keys-scene';
import { RollupScene } from '@/components/iso/rollup-scene';
import { SignatureScene } from '@/components/iso/signature-scene';
import { ValidatorsScene } from '@/components/iso/validators-scene';
import { NodeScene } from '@/components/iso/node-scene';
import { UpgradeScene } from '@/components/iso/upgrade-scene';
import { ExplorerScene } from '@/components/iso/explorer-scene';
import { TokenScene } from '@/components/iso/token-scene';
import { SmartWalletScene } from '@/components/iso/smart-wallet-scene';
import { PrivacyScene } from '@/components/iso/privacy-scene';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    SectionCards,
    // isometric explainers for the Căn bản pages
    ChainScene,
    ByzantineScene,
    ConsensusScene,
    ValidatorsScene,
    KeysScene,
    SignatureScene,
    ContractScene,
    GasScene,
    BlockAnatomy,
    RollupScene,
    NodeScene,
    UpgradeScene,
    ExplorerScene,
    TokenScene,
    SmartWalletScene,
    PrivacyScene,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
