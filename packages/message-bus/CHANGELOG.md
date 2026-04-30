# @xolvio/message-bus

## 1.148.0

### Minor Changes

- [`d5ba3a0`](https://github.com/BeOnAuto/auto-engineer/commit/d5ba3a0e3fb0f6a9ad7a3a8b1815590ea77a5b42) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added state context instruction to generated decide handlers, preventing unnecessary narrowing when Given steps contain only state references

- [`e0cdc4e`](https://github.com/BeOnAuto/auto-engineer/commit/e0cdc4e3363ad84d4bc49996a600ac75c97ccc38) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added context-aware classification of non-command fields in generated decide.ts scaffolds, distinguishing between date-derived, state-derived, and not-yet-tested fields

- [`9195db7`](https://github.com/BeOnAuto/auto-engineer/commit/9195db78cb707d658866cee99a1c73d34fb4efde) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Extracted shared template helpers into a dedicated module for cleaner code generation

- [`abb6540`](https://github.com/BeOnAuto/auto-engineer/commit/abb6540db7196ed7935c8a8610695828f9035fc3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added status variant hints from Given state references to the state template, helping implementers create matching discriminated union variants

- [`9195db7`](https://github.com/BeOnAuto/auto-engineer/commit/9195db78cb707d658866cee99a1c73d34fb4efde) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Extracted shared template helper functions into a dedicated module for better code reuse across generators
  - Simplified template specs by removing inline duplicate definitions in favor of the shared helpers

### Patch Changes

- [`88fb1da`](https://github.com/BeOnAuto/auto-engineer/commit/88fb1da2b222de04dd4959d87657395ee960a6ce) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: skip empty file plans in scaffold output
  - **server-generator-apollo-emmett**: filter state refs from given() in decide.specs.ts.ejs
  - **server-generator-apollo-emmett**: move CS Given states from events to states array
  - **global**: version packages
  - **server-generator-apollo-emmett**: mark G1+G2 ketchup plan complete

- [`4255f6d`](https://github.com/BeOnAuto/auto-engineer/commit/4255f6db0d128979e573244a615886482ce799b0) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated ketchup plan for state reference fix in decide template generator
  - Marked generator bug fix milestones G1 and G2 as complete

- [`62f1ea3`](https://github.com/BeOnAuto/auto-engineer/commit/62f1ea3dd1b4275211574e3df9d9a6571ae9b27a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed scaffold generation to correctly distinguish between event and state references in decision handlers
  - Prevented contradictory instructions from appearing in generated code when Given clauses contain only state references

- [`ba4f5c9`](https://github.com/BeOnAuto/auto-engineer/commit/ba4f5c9749fb1c15d444e78ca9a2689817f039cb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added implementation plan for decide.ts code generation fixes in the Apollo Emmett server generator

## 1.147.0

### Minor Changes

- [`e2d4008`](https://github.com/BeOnAuto/auto-engineer/commit/e2d4008281a41617cf5f9d569ed22badcf0cd065) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: generate aggregateStream pre-loading for cross-scene Givens
  - **server-generator-apollo-emmett**: compute crossSceneGivens in template data
  - **react-gen**: clean stale src/ subdirectories in scaffold step
  - **server-generator-apollo-emmett**: return single object for id-lookup query resolvers
  - **server-generator-apollo-emmett**: use narrative prefix in cross-scene import paths

### Patch Changes

- [`6b87393`](https://github.com/BeOnAuto/auto-engineer/commit/6b873936a12636585cbddf03e4d752dde9080155) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added planning documentation for fixing cross-stream Given states in the server generator

- [`0316cef`](https://github.com/BeOnAuto/auto-engineer/commit/0316cefd25f16e986418290337a9e813fa8395b1) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added planning document for fixing generator bugs related to G1 and G2 scenarios

- [`cde9ffa`](https://github.com/BeOnAuto/auto-engineer/commit/cde9ffa01867f4a989ecdb79a0849246021b9e86) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed empty files being generated in scaffold output for query/projection moments that have no local events

- [`53d65dd`](https://github.com/BeOnAuto/auto-engineer/commit/53d65dd80a3c348bc584c474bd2dc8ab5e9737cb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Marked the G1+G2 ketchup plan as complete for the Apollo Emmett server generator

- [`1c99de6`](https://github.com/BeOnAuto/auto-engineer/commit/1c99de6e21e406d879fa964372ecb58e84f5b616) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed incorrect placement of Given-step state references (e.g. WorkoutDraft, UserProfile) that were being added to the events array instead of the states array
  - Eliminated phantom Event types appearing in generated events.ts files
  - Eliminated phantom case handlers appearing in generated evolve.ts files

- [`f6cb5c2`](https://github.com/BeOnAuto/auto-engineer/commit/f6cb5c2908dc7cabf2a1d93c9000ad9682452cf7) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed generated test files incorrectly using state references as events in the given() setup, ensuring only actual event references are included

- [`54b5163`](https://github.com/BeOnAuto/auto-engineer/commit/54b5163e6752ce2a2438aae1d759810d5460a687) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Reverted cross-stream aggregate pre-loading in generated command handlers
  - Command handlers now correctly operate on a single stream, aligning with Emmett's event sourcing model
  - Cross-aggregate data should be passed via command enrichment instead of pre-loading from other streams

## 1.146.0

### Minor Changes

- [`d5786a1`](https://github.com/BeOnAuto/auto-engineer/commit/d5786a13f0a725715c6a7cf460576ec5ae2cf006) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added cross-scene Given event detection that identifies when a Given step references events produced by a different scene
  - Computes source stream patterns and links stream pattern variables to command fields for proper event resolution in handle templates

- [`f919ab8`](https://github.com/BeOnAuto/auto-engineer/commit/f919ab8b5954397a2c73a4c6f2ea0f781fb42373) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added automatic pre-loading of cross-scene Given events in generated command handlers
  - Generated handle.ts now reads external aggregate state from the event store before processing commands
  - Ensures cross-scene events are available at runtime, matching test behavior

- [`b43f4e5`](https://github.com/BeOnAuto/auto-engineer/commit/b43f4e5cea147bc94d2baa31ca41694fa8ac0648) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added automatic cleanup of stale source directories during project scaffolding to prevent validation failures from prior generations

- [`08b1aac`](https://github.com/BeOnAuto/auto-engineer/commit/08b1aac466fcaa402bae5f347b29d26309c07533) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: replace UISchema with UISpecSchema for JSON Render specs
  - **global**: version packages

### Patch Changes

- [`1bb3450`](https://github.com/BeOnAuto/auto-engineer/commit/1bb3450e2a717095a729567b10c7cdd4c2cc0ee3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed cross-scene import paths to include the narrative prefix in directory names, resolving broken references between scenes in generated Apollo/Emmett server code

- [`5c461e2`](https://github.com/BeOnAuto/auto-engineer/commit/5c461e2a0b179196f5fee1bc6e97f12d786869f4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added plan for cleaning up stale directories in the React generator

- [`e50042b`](https://github.com/BeOnAuto/auto-engineer/commit/e50042b4aa74c6927f21d3fa4cead565ebe1b321) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added source scene directory name to Message type to support correct cross-scene import path resolution

- [`20c1f72`](https://github.com/BeOnAuto/auto-engineer/commit/20c1f7251a75f01c874908b535689f5b005f480d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Finalized cleanup plan for removing stale directories during React code generation scaffolding

- [`ee01249`](https://github.com/BeOnAuto/auto-engineer/commit/ee01249e68270d940039bf9721d14f7e120f5424) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Finalized planning for cross-scene Given events support in the Apollo Emmett server generator

- [`d2d750d`](https://github.com/BeOnAuto/auto-engineer/commit/d2d750dc7d4f0e7d350fd1b4f7f2cafc2f4d249b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Per-entity query resolvers that look up by ID now return a single object (or null) instead of an array
  - Automatically detects ID-lookup queries based on argument mapping to the entity's ID field

- [`bb63e07`](https://github.com/BeOnAuto/auto-engineer/commit/bb63e071efadb52a838efa1c677caf1640fdf69f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added planning for cross-scene Given event support in server command handlers

- [`2a893a3`](https://github.com/BeOnAuto/auto-engineer/commit/2a893a38f3a7b568fd608ec0e09644984167a95b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Finalized plan for G1 and G3 fixes in the Apollo Emmett server generator

## 1.145.0

### Minor Changes

- [`c5d46fe`](https://github.com/BeOnAuto/auto-engineer/commit/c5d46fe4a647b3ab5e2871a7c00654e54b53b639) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Replaced UISchema with a new technology-agnostic UISpecSchema for JSON Render specifications
  - Introduced UIElementSchema and UISpecSchema as cleaner, spec-based alternatives to the old layout-based schema
  - Removed legacy RegionEntrySchema and old layoutId/mode/regions/customizationNotes fields in favor of the new UISpec structure

### Patch Changes

- [`ab2a8c5`](https://github.com/BeOnAuto/auto-engineer/commit/ab2a8c5837252113db0a86250e441f2143fac771) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **react-gen**: remove mock data, use real GraphQL backend

## 1.144.0

### Minor Changes

- [`a5f1d1c`](https://github.com/BeOnAuto/auto-engineer/commit/a5f1d1ced73d202eeeddf3030f0f865b214a43a8) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-gen**: dnd-kit drag-and-drop quality improvements
  - **global**: version packages

### Patch Changes

- [`7414e34`](https://github.com/BeOnAuto/auto-engineer/commit/7414e34e5908627f2ceb4dfd0deffc632b73f1ae) Thanks [@osamanar](https://github.com/osamanar)! - - Removed mock data and connected to real GraphQL backend at localhost:4000/graphql
  - Restored proper loading, empty, and error states for all data components
  - Network errors now surface immediately instead of being silently caught

## 1.143.0

### Minor Changes

- [`07c633b`](https://github.com/BeOnAuto/auto-engineer/commit/07c633b381251fd9dd4348b3e3ff6e11e82442f9) Thanks [@osamanar](https://github.com/osamanar)! - - Improved drag-and-drop quality with rich overlay rendering showing full card details like labels, dates, and avatars
  - Added globally unique draggable IDs scoped by container to prevent conflicts across component instances
  - Enhanced mock data generation with unique IDs that include parent context

### Patch Changes

- [`f39f2e8`](https://github.com/BeOnAuto/auto-engineer/commit/f39f2e8622c9f090306af9177ff4a060c41b34a4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **react-gen**: speed optimizations — parallel router+validation, reduced steps

## 1.142.0

### Minor Changes

- [`f0224ea`](https://github.com/BeOnAuto/auto-engineer/commit/f0224ea914ad2136cc7b40d2c26272e31daab58b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-gen**: autoresearch iteration — premium SaaS quality output
  - **global**: pnpm lock
  - **global**: version packages

### Patch Changes

- [`1f1138e`](https://github.com/BeOnAuto/auto-engineer/commit/1f1138e1cb61d2e576a6af77c8ca0c646f31ae6c) Thanks [@osamanar](https://github.com/osamanar)! - - Parallel execution of router and validation agents, reducing generation time from ~5:47 to ~3:25
  - Reduced default step counts for all agents, resulting in faster completions
  - Added timing instrumentation to the pipeline for performance profiling

## 1.141.0

### Minor Changes

- [`96eb7fa`](https://github.com/BeOnAuto/auto-engineer/commit/96eb7faedbb06ee72415ea68cb44c7851a71f4a3) Thanks [@osamanar](https://github.com/osamanar)! - - Added 10-iteration autoresearch loop that improves generated app visual quality from ~3.5/10 to ~8/10
  - Improved prompt quality: realistic mock data in every component, denser page layouts, no duplicate nav bars, and richer landing pages with minimum 5 sections
  - Fixed newline handling in generated files and graceful error recovery for GraphQL queries
  - Added drag-and-drop support with @dnd-kit libraries

### Patch Changes

- [`bd56512`](https://github.com/BeOnAuto/auto-engineer/commit/bd56512adeae8adc1b392c6619422fe8fdc49a49) Thanks [@osamanar](https://github.com/osamanar)! - - Updated package manager lock file to ensure consistent dependency resolution

- [`d39fefb`](https://github.com/BeOnAuto/auto-engineer/commit/d39fefbd47b403b1249184c2fa07a2f2f840eff2) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: update design tokens and README for Scene/Moment rename

## 1.140.1

### Patch Changes

- [`f0fed96`](https://github.com/BeOnAuto/auto-engineer/commit/f0fed96e8e43283d2c397f4d5223dc81160c1181) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: rename Journey→Narrative, Narrative→Scene, Slice→Moment

- [`e0421d7`](https://github.com/BeOnAuto/auto-engineer/commit/e0421d7325b74bdc5fdf186e9d9106ce1670fb14) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated design tokens and documentation to reflect the Scene/Moment naming convention

## 1.140.0

### Minor Changes

- [`2b1315d`](https://github.com/BeOnAuto/auto-engineer/commit/2b1315d27aa7fbb5137f098c174b7b1daebbb821) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-gen**: domain-aware theming, flexible layouts, chain-of-thought color selection
  - **global**: version packages

### Patch Changes

- [`26e5682`](https://github.com/BeOnAuto/auto-engineer/commit/26e56821d984838ba3720baca89c74fc012357c5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Renamed core entity hierarchy: Journey→Narrative, Narrative→Scene, Slice→Moment for clearer domain language
  - Updated DSL functions and schemas to match new naming (narrative(), scene(), moment())
  - Server-generated directory structure now uses narrative-prefixed paths under domain/narratives
  - Narratives are now required on Model and auto-populated by assembleSpecs

## 1.139.0

### Minor Changes

- [`2451a60`](https://github.com/BeOnAuto/auto-engineer/commit/2451a6024eeec4787b6cd5be965e25a8fc147363) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-gen**: simplify interaction rules and prevent duplicate nav header
  - **react-gen**: add specific micro-interaction patterns for cards, buttons, and stat elements
  - **react-gen**: reduce overfitting by offering layout pattern choices instead of mandating one
  - **react-gen**: enhance landing page feature previews and dark CTA footer
  - **react-gen**: add nav CTA button and enforce stat cards on query pages

- [`e78f764`](https://github.com/BeOnAuto/auto-engineer/commit/e78f7640fa34a7feb76837e37d082b4a69cd4ce1) Thanks [@osamanar](https://github.com/osamanar)! - - Domain-aware theming with chain-of-thought color selection that analyzes the domain before picking brand-appropriate colors
  - Flexible layouts and persona-driven design for landing and narrative pages, replacing rigid templates
  - Configurable environment variables for model path, schema path, and output directory
  - Added pet adoption sample model for comparison testing
  - Fixed duplicate navigation header rendering

## 1.138.0

### Minor Changes

- [`4ac66da`](https://github.com/BeOnAuto/auto-engineer/commit/4ac66daaff20cda04c3fd5daa56db4a09cae665d) Thanks [@osamanar](https://github.com/osamanar)! - - Strengthened page layout generation with a structured 3-section format and explicit grid patterns for more consistent, polished outputs

- [`6f202a5`](https://github.com/BeOnAuto/auto-engineer/commit/6f202a50cd6119f983c66963c64e73e0efac6b05) Thanks [@osamanar](https://github.com/osamanar)! - - Added specific micro-interaction patterns for cards, buttons, and stat elements to improve UI polish in generated components

- [`3398c9e`](https://github.com/BeOnAuto/auto-engineer/commit/3398c9e5edd6c2340abb9666702d69f192d7fdfa) Thanks [@osamanar](https://github.com/osamanar)! - - Improved hero app preview display
  - Fixed crash caused by Select.Item component

- [`b654dc5`](https://github.com/BeOnAuto/auto-engineer/commit/b654dc5404428f360f4c61452fcf94880acd2781) Thanks [@osamanar](https://github.com/osamanar)! - - Simplified interaction rules for generated React components
  - Fixed duplicate navigation header rendering issue

- [`b526340`](https://github.com/BeOnAuto/auto-engineer/commit/b526340194ad1b029bd3591d9a30307e28f2d834) Thanks [@osamanar](https://github.com/osamanar)! - - Layout patterns are now offered as choices instead of being enforced, reducing repetitive outputs and giving more variety in generated pages

- [`1c87aee`](https://github.com/BeOnAuto/auto-engineer/commit/1c87aeeadb281f3621560576cb68d38cbd74d2a5) Thanks [@osamanar](https://github.com/osamanar)! - - Enforced consistent theming across generated React pages for a more cohesive visual style
  - Enhanced page layouts with richer, more varied content sections in narrative-driven generation

- [`8cab4a4`](https://github.com/BeOnAuto/auto-engineer/commit/8cab4a4d5ea2a95feb0fc1fbe0a0f4105d3fe97c) Thanks [@osamanar](https://github.com/osamanar)! - - Added a call-to-action button in the navigation bar
  - Enforced stat cards layout on query-based pages

- [`81d4a20`](https://github.com/BeOnAuto/auto-engineer/commit/81d4a20bd9d0e4f3097167f97c083148755cc02e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/react-gen**: improves react gen
  - **global**: version packages

- [`3443085`](https://github.com/BeOnAuto/auto-engineer/commit/3443085de34b9d06f9bea240e0cdc9e99ffbfeba) Thanks [@osamanar](https://github.com/osamanar)! - - Enhanced landing page feature preview sections with improved visual presentation
  - Added dark-themed call-to-action footer section

## 1.137.0

### Minor Changes

- [`9bbad04`](https://github.com/BeOnAuto/auto-engineer/commit/9bbad0453a32cd3113def34556ea2aa753f2004b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: wire batchId through server with sync pending-count resolution
  - **pipeline**: scope computeCommandStats to latest batch
  - **pipeline**: add batchId field to ItemStatusDocument and evolve fallback
  - **global**: version packages
  - **pipeline**: update ketchup plan — mark batch fix bursts as done

- [`4bb60a9`](https://github.com/BeOnAuto/auto-engineer/commit/4bb60a9756033fb7d0bd379a4444abff1f7997bf) Thanks [@osamanar](https://github.com/osamanar)! - - Added GraphQL code generation with typed operations and automatic schema validation
  - Introduced batch skill loading to replace individual calls, improving pipeline efficiency
  - Parallelized code generation with LLM agents and embedded operations content to eliminate extra round-trips
  - Enforced named exports and hardened prompts to prevent invalid GraphQL operations
  - Added graphqlSchema as a pipeline input with split queries and mutations output files

## 1.136.0

### Minor Changes

- [`bdd8d81`](https://github.com/BeOnAuto/auto-engineer/commit/bdd8d81adf9e3f86cf43820514223143d6fcd14e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added batch tracking for pipeline items so concurrent requests are automatically grouped into the same batch while sequential dispatches create separate batches
  - Settled retries now reuse their existing batch instead of creating a new one
  - Updated server to synchronously resolve batch IDs before async processing, ensuring consistent grouping

- [`0044b08`](https://github.com/BeOnAuto/auto-engineer/commit/0044b0808880de6be11ef1f9b5f9a9fbca921903) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Command statistics now only consider items from the latest batch, preventing stale errors from previous runs from affecting the overall status
  - Existing items without batch information continue to work as before

- [`a0b25c1`](https://github.com/BeOnAuto/auto-engineer/commit/a0b25c154364845ab8e16351ec250d9b236aef72) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added optional batchId field to item status tracking, allowing batch context to be preserved across status updates
  - Status updates (success/error) now automatically inherit the batchId from the original creation event without requiring it to be passed again

- [`ad38009`](https://github.com/BeOnAuto/auto-engineer/commit/ad380090e151f9a14092e6d6bbea28fae37c32c3) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add UISchema, RegionEntrySchema, ComponentDefinitionSchema and extend DesignSchema
  - **global**: version packages

### Patch Changes

- [`9217fdd`](https://github.com/BeOnAuto/auto-engineer/commit/9217fdd02fd93b4b6875dab9a0178ba5b213a0b2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated project plan to mark batch fix tasks as completed

- [`69240b0`](https://github.com/BeOnAuto/auto-engineer/commit/69240b004d8f200847ed5eb0d83e01137a0cde77) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added plan for fixing stale batch error contamination in the pipeline

## 1.135.0

### Minor Changes

- [`f032a8d`](https://github.com/BeOnAuto/auto-engineer/commit/f032a8d37a73c688b4cb6f68de574b9ee7d32518) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added UI composition schemas for defining layout regions and component definitions
  - Extended design schema with optional UI field for layout configuration
  - Added model-level design schema with optional components array

- [`6ca448c`](https://github.com/BeOnAuto/auto-engineer/commit/6ca448c3b0fa108a2569003eddfef97f5e808072) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-gen**: add graphqlSchema field to GenerateReactApp command
  - **react-gen**: accept model object directly in GenerateReactApp command
  - **react-gen**: migrate from ADK JS to Vercel AI SDK + bash-tool skills
  - **react-gen-py**: add Python ADK port of react-gen using google-adk
  - **react-gen**: add landing page agent, validation pipeline, and starter updates

## 1.134.0

### Minor Changes

- [`6e7aea4`](https://github.com/BeOnAuto/auto-engineer/commit/6e7aea4e81b3e7050211b68abdd346d78b255c2e) Thanks [@osamanar](https://github.com/osamanar)! - - Added full Python port of the react-gen package using Google ADK, enabling React app generation without Node-based ADK
  - Leverages native Python ADK features including skill toolsets, loop escalation, LiteLlm provider routing, and callable instructions for improved prompt handling
  - Generates complete React + Vite + Tailwind + shadcn/ui applications from a domain model in approximately 4.5 minutes

- [`574fd54`](https://github.com/BeOnAuto/auto-engineer/commit/574fd540c4db876773b4c0e042a8ce56aabcf1f5) Thanks [@osamanar](https://github.com/osamanar)! - - Migrated from Google ADK to Vercel AI SDK for more reliable and flexible AI orchestration
  - Added 12 new skills from the Python port, bringing the JS package to the full 16-skill set
  - Rewrote all agents as plain async functions, replacing complex class hierarchies with simpler patterns
  - Added bash-tool integration for dynamic skill discovery and loading

- [`dc22612`](https://github.com/BeOnAuto/auto-engineer/commit/dc22612671d72076e31d36e2db4465fcab8a23f5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added optional GraphQL schema field and direct model object support to the React app generation command, enabling more flexible input options
  - Fixed graph label enrichment so dynamically-added command nodes are correctly labeled in the pipeline visualization

- [`31e8e1b`](https://github.com/BeOnAuto/auto-engineer/commit/31e8e1ba59ea589d6cb6fd9f615f19d3b97cb182) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added support for passing a model object directly to GenerateReactApp, removing the requirement to write the model to disk first
  - Aligned GenerateReactApp's interface with GenerateServer, allowing consistent usage across both commands

- [`db17d33`](https://github.com/BeOnAuto/auto-engineer/commit/db17d337150f16a45336aab71a953418622b0fda) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-gen**: add landing page agent, validation pipeline, and starter updates
  - **server-generator-apollo-emmett**: wire mappings through scaffoldFromSchema
  - **server-generator-apollo-emmett**: add ArgMapping with operator support
  - **server-generator-apollo-emmett**: update query resolver template for value-mapped arg filtering
  - **server-generator-apollo-emmett**: update projection template for per-event getDocumentId

### Patch Changes

- [`beb2621`](https://github.com/BeOnAuto/auto-engineer/commit/beb2621e4e3183fbc9ac573d75bb3371f210313a) Thanks [@osamanar](https://github.com/osamanar)! - - Removed the Python ADK port package, as the JavaScript package now provides full feature parity after migrating to Vercel AI SDK with bash-tool skills

- [`633f575`](https://github.com/BeOnAuto/auto-engineer/commit/633f575fbc62fc6c59e7a98e8be725124d49e822) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed linting and formatting errors in design-system scripts for the React generator

- [`0572671`](https://github.com/BeOnAuto/auto-engineer/commit/05726719543c6f574c03ef7201ddc0f6513f061d) Thanks [@osamanar](https://github.com/osamanar)! - - Raised cognitive complexity threshold to unblock CI pipeline

- [`b54575c`](https://github.com/BeOnAuto/auto-engineer/commit/b54575c8bc5add295158e8dd9e82c74f112d428c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Decoupled front-end and back-end build pipelines so they can run independently
  - Renamed build commands to build:frontend and build:backend for clarity
  - Front-end build is now dispatched externally rather than chained to back-end generation

- [`70e80cd`](https://github.com/BeOnAuto/auto-engineer/commit/70e80cdd8344b0cf68ff8a5746284e705aa43a64) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated project documentation to mark completed work items

- [`c00fcc8`](https://github.com/BeOnAuto/auto-engineer/commit/c00fcc8496a5bd4d2affe10635fb8dcfbdce0cf9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed graph label enrichment so dynamically-added command nodes correctly receive display names

- [`14d4dc7`](https://github.com/BeOnAuto/auto-engineer/commit/14d4dc72c8a0054936edab8f6238ffb9eb65625e) Thanks [@osamanar](https://github.com/osamanar)! - - Suppressed cognitive complexity lint warning in the ESM imports fix script

- [`8de58a2`](https://github.com/BeOnAuto/auto-engineer/commit/8de58a29db06138aba6da42f2735f7529dbb9e03) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added planning document for decoupling front-end and back-end build processes

- [`8c4df3a`](https://github.com/BeOnAuto/auto-engineer/commit/8c4df3af6645b33465bef95942946e5ce87e6e41) Thanks [@osamanar](https://github.com/osamanar)! - - Reduced cognitive complexity in the ESM imports fix script for improved maintainability

## 1.133.0

### Minor Changes

- [`27571bf`](https://github.com/BeOnAuto/auto-engineer/commit/27571bf23744020052fe311284b2f16915c93be6) Thanks [@osamanar](https://github.com/osamanar)! - - Added landing page agent for automated landing page generation
  - Introduced validation pipeline for generated output quality checks
  - Updated starter templates with latest configuration and defaults

- [`711787a`](https://github.com/BeOnAuto/auto-engineer/commit/711787a071ac2f538f53674c5b9323ac699d513c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: wire mappings through scaffoldFromSchema
  - **server-generator-apollo-emmett**: add ArgMapping with operator support
  - **server-generator-apollo-emmett**: update query resolver template for value-mapped arg filtering
  - **server-generator-apollo-emmett**: update projection template for per-event getDocumentId
  - **server-generator-apollo-emmett**: wire eventIdFieldMap and argToStateFieldMap through templates

### Patch Changes

- [`374aeed`](https://github.com/BeOnAuto/auto-engineer/commit/374aeed0d7928583e3c97d624e99272e469fc56d) Thanks [@osamanar](https://github.com/osamanar)! - - Optimized react generation pipeline from ~8 minutes to ~3 minutes by using frozen lockfile and reducing validation iterations
  - Fixed landing page navigation by injecting route paths and using proper Link components instead of plain buttons
  - Batched theme validation errors into a single response for fewer iterations

- [`75f92f9`](https://github.com/BeOnAuto/auto-engineer/commit/75f92f9978eed1a913601a80b0d153a59d42646f) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed landing page generation reliability by using a fixed file path, preventing the AI from writing to incorrect locations
  - Resolved issue where landing pages could be flagged as missing and replaced with lower-quality versions

- [`8ee6686`](https://github.com/BeOnAuto/auto-engineer/commit/8ee6686b15e40c0357d2ebdbb1dbfb84a966fcb5) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed 100+ code formatting and lint issues across the monorepo
  - Resolved pre-existing type errors in component implementation classes
  - Excluded generated starter and output directories from lint checks

## 1.132.0

### Minor Changes

- [`7ab10bd`](https://github.com/BeOnAuto/auto-engineer/commit/7ab10bd6a89fc0c0612a9ec1708479093506ae4e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add buildTypeInfoFromMessages for messages-to-TypeInfo map conversion
  - **narrative**: add messageToTypeInfo adapter for Message-to-TypeInfo conversion
  - **server-implementer**: detect forbidden type assertions in AI-generated code
  - **narrative**: resolve InferredType via messages-derived fallback in createTypeResolver
  - **server-generator-apollo-emmett**: generate events.ts for query slices with orphan events

- [`f3c4419`](https://github.com/BeOnAuto/auto-engineer/commit/f3c4419bceaf39026399d903fdf6a39917d8c7ad) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed InferredType sentinels leaking into output models when no TypeScript AST is available by falling back to message-derived type resolution
  - Added events.ts generation for query slices, fixing broken imports when query projections reference events with no producing command slice
  - Added detection of forbidden type assertions (e.g. `as` casts) in AI-generated code, triggering automatic retries with guidance to use typed variables instead

- [`81332d2`](https://github.com/BeOnAuto/auto-engineer/commit/81332d21e016330f917fb2a6a9854e5d68bbb2ed) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added support for wiring field mappings through schema scaffolding for queries
  - Operator mappings like gte/lte now render as comparison operators (< and >) in generated resolver code

- [`a9067d1`](https://github.com/BeOnAuto/auto-engineer/commit/a9067d1113be00adcffcaab6c0b75a5d2baa53d5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added per-event ID field resolution via buildEventIdFieldMap, enabling each event type to specify its own ID field mapping

- [`d6bce3a`](https://github.com/BeOnAuto/auto-engineer/commit/d6bce3af9358cc54b13a3750bd815b5e3339c31a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated query resolver template to support value-mapped argument filtering for more precise data querying

- [`619554e`](https://github.com/BeOnAuto/auto-engineer/commit/619554e6fe971ee5a51b8fe64607322e7e8bcaeb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added argument mapping with operator support for Apollo/Emmett server generation, enabling explicit control over how query arguments map to state fields with configurable operators (e.g., equality, greater than)
  - Refactored argument-to-state field mapping to support rich mapping entries with operators instead of simple string-to-string mappings
  - Added fallback behavior that defaults to equality operator when no explicit mapping is provided

- [`60a781f`](https://github.com/BeOnAuto/auto-engineer/commit/60a781f4c14d2d42d2412e61c0b070d37cd5e97c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added support for wiring event ID field maps and argument-to-state field maps through code generation templates

- [`f71ce9e`](https://github.com/BeOnAuto/auto-engineer/commit/f71ce9e154c548797916f1708d2fef8a2c8546fb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated projection template to support per-event document ID resolution

- [`2b2d34b`](https://github.com/BeOnAuto/auto-engineer/commit/2b2d34b56790eb8f355e3291c9e0dc4e105cd976) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added extraction of stream ID fields from stream pattern variables in the Apollo Emmett server generator

- [`000dc5e`](https://github.com/BeOnAuto/auto-engineer/commit/000dc5e633d663a7fffd24e9442e264bab7648ae) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added value-matched argument filtering via field map builder for Apollo Emmett server generation

### Patch Changes

- [`2845c26`](https://github.com/BeOnAuto/auto-engineer/commit/2845c26e542cccf70c7df4cd17e5e08d9b8271b4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added integration test coverage for multi-event projection ID field handling

- [`e03eea6`](https://github.com/BeOnAuto/auto-engineer/commit/e03eea6716689f1566890454d3763bc17ba2228c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - This single commit only updates the ketchup plan file (a planning document). There are no user-facing code changes.
  - Finalized implementation plan for per-event ID field resolution and argument mapping improvements

- [`5a7117b`](https://github.com/BeOnAuto/auto-engineer/commit/5a7117b068b2b71091f04d84697c0404495756a2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added optional operator support to mapping entry schema for more flexible field mapping configurations

- [`19e2ef6`](https://github.com/BeOnAuto/auto-engineer/commit/19e2ef6e04d5722bd4097ec9332fdd3fe6fb7cda) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added integration test for value-mapped argument-to-state filtering in Apollo/Emmett server generator

- [`3e8ede9`](https://github.com/BeOnAuto/auto-engineer/commit/3e8ede919ba6544a057dead7cbbb5135e5e4bef4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added planning for explicit argument-to-field mapping with operator support in query resolvers

## 1.131.0

### Minor Changes

- [`8791296`](https://github.com/BeOnAuto/auto-engineer/commit/8791296a126f213d171c6dd7d2d4738c0fc2a19e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: add escapeJsString utility for EJS template safety
  - **server-generator-apollo-emmett**: escape apostrophes in react.specs.ts.ejs string literals
  - **server-generator-apollo-emmett**: escape apostrophes in decide template string literals
  - **server-generator-apollo-emmett**: escape apostrophes in projection.specs.ts.ejs string literals
  - **global**: version packages

- [`a2c7ada`](https://github.com/BeOnAuto/auto-engineer/commit/a2c7ada17acecc6e175dd0caea7f7d3b4bf0b67e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added adapter to convert Message objects to TypeInfo format, enabling message-based type inference in the narrative pipeline

- [`b3515b8`](https://github.com/BeOnAuto/auto-engineer/commit/b3515b8c09a70063c1ffe361b2d6f68af299fa05) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added utility to convert message arrays into TypeInfo maps for narrative processing

- [`2546535`](https://github.com/BeOnAuto/auto-engineer/commit/2546535ea50987fb58c9caee4803d871861acee2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added automatic detection of forbidden type assertions (e.g., `as` casts) in AI-generated code to enforce type safety
  - Type assertion violations now trigger a retry loop with guidance for the AI to use properly typed variables instead
  - Detection runs in parallel with existing shadow checks during test and typecheck phase

### Patch Changes

- [`7a3967e`](https://github.com/BeOnAuto/auto-engineer/commit/7a3967e1c12d418786cf754fff019e509cc06e07) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added implementation plan for query events support and type assertion detection

- [`f485b24`](https://github.com/BeOnAuto/auto-engineer/commit/f485b24c738dabb21d2d25765f70239eb423a666) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Finalized implementation plan for InferredType messages fallback resolution

- [`aa38eaa`](https://github.com/BeOnAuto/auto-engineer/commit/aa38eaace31f050cbeb04e8fb698fbd380678aaa) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed type resolution failing for JSON-loaded models where placeholder types leaked into the output instead of resolving to their actual definitions

- [`0485e54`](https://github.com/BeOnAuto/auto-engineer/commit/0485e544e8581f8d849444a66dded98adba82184) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed broken imports in query projections that reference events not produced by any command slice
  - Added events.ts file generation for query slice templates so orphan event imports resolve correctly

- [`cb750ce`](https://github.com/BeOnAuto/auto-engineer/commit/cb750ce35c027eb1d883544c58085e2e6d3270ad) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added implementation plan for fixing InferredType messages fallback behavior

- [`7f3ed00`](https://github.com/BeOnAuto/auto-engineer/commit/7f3ed00072378615124aed1d3d98f4a0fab8c58e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Finalized implementation plan for query event generation and type assertion detection

## 1.130.0

### Minor Changes

- [`7a5544a`](https://github.com/BeOnAuto/auto-engineer/commit/7a5544a66ec42f25cc83fdc7717e9cce87e7e98e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added escapeJsString utility to safely handle special characters in EJS template string interpolation
  - Prevents template rendering errors caused by single quotes, backslashes, newlines, and carriage returns in user-provided strings

- [`f4e7c16`](https://github.com/BeOnAuto/auto-engineer/commit/f4e7c167d4150bba383cf9bc162167eb0924275b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: auto-derive item key extractors from handler fields
  - **react-component-implementer**: improvements
  - **global**: improvements
  - **changesets**: update remaining generate-theme refs to set-theme
  - **changesets**: update generate-theme to set-theme in changeset

### Patch Changes

- [`d108c53`](https://github.com/BeOnAuto/auto-engineer/commit/d108c530cabf9eed61a280d01000010d3ac7eacf) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed code generation errors when rule names contain apostrophes (e.g. "List of user's workouts") by escaping special characters in generated test files

- [`f9b46ad`](https://github.com/BeOnAuto/auto-engineer/commit/f9b46ada5eb692f3de0d9f16f5240a3463099447) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed template generation errors caused by apostrophes in rule descriptions, test descriptions, and error messages
  - Added string escaping utility to safely handle special characters in generated code templates

- [`5134e46`](https://github.com/BeOnAuto/auto-engineer/commit/5134e4671549241f127c1a5fc40815047fdbcdb9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed generated test files failing to parse when rule names or descriptions contain apostrophes

- [`3303685`](https://github.com/BeOnAuto/auto-engineer/commit/330368567679f3023815bec3234a777c3f7220fc) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added implementation plan for fixing JavaScript string escaping in the Apollo Emmett server generator

## 1.129.0

### Minor Changes

- [`7f7be75`](https://github.com/BeOnAuto/auto-engineer/commit/7f7be753a0ff7420af0c55668912cfafb42f336e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: auto-derive item key extractors from handler fields

- [`e527bfd`](https://github.com/BeOnAuto/auto-engineer/commit/e527bfd3968fe59ece64c59daeb37d16d3cfca81) Thanks [@osamanar](https://github.com/osamanar)! - Based on the actual changes, here's the changelog:
  - Added placeholder components with animated loading state shown in Storybook while components are being generated
  - Added CLI script for generating individual components from a jobs file
  - Replaced generic model-based spec deltas with specific molecule component specs (milestone badge, points preview, stats summary, workout details, workout list)
  - Removed unused input component specs (action button, command palette, data card, and others)

- [`bbbfa05`](https://github.com/BeOnAuto/auto-engineer/commit/bbbfa0599742b01c193e606595499d8a6134bf78) Thanks [@osamanar](https://github.com/osamanar)! - Based on the actual diff, here's the changelog:
  - Added pipeline logging with per-stage timing, token usage tracking, and a summary report for component generation runs
  - Improved pipeline performance by running initial type checks and tests in parallel and skipping fix loops when checks already pass
  - Enhanced fix loop agents with iteration tracking and smarter stage-level diagnostics

### Patch Changes

- [`3336cb7`](https://github.com/BeOnAuto/auto-engineer/commit/3336cb777143f074660e0ad86f60c9345c36c9b8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add full round-trip tests for InferredType sentinel resolution

- [`33897af`](https://github.com/BeOnAuto/auto-engineer/commit/33897aff7eff17fd1782e296e75d80f43fb21d13) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use node:crypto protocol in handle.ts.ejs template

- [`2d77738`](https://github.com/BeOnAuto/auto-engineer/commit/2d77738762a1ae5e85a9ad34dd21f18871c6adf3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: prevent InferredType sentinel leak when type resolution fails

- [`db71f00`](https://github.com/BeOnAuto/auto-engineer/commit/db71f00758c24a1a8b55600858b7568c823af4f9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: handle GraphQL ListType in getTypeName to preserve array semantics

- [`cf3f103`](https://github.com/BeOnAuto/auto-engineer/commit/cf3f1034892e9d14ea3b9aeb1fec7469e689fa62) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: use nodeStatus as fallback when no item key extractor exists

- [`d7fc4cb`](https://github.com/BeOnAuto/auto-engineer/commit/d7fc4cbc69aa2a938e9573c1fd39f371db795723) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: verify manual extractor takes precedence over auto-derived

- [`9b6c6a6`](https://github.com/BeOnAuto/auto-engineer/commit/9b6c6a602ca21403cdb17aa337b53c333fdb64ea) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **set-theme**: replace GenerateTheme with SetTheme command

- [`4d47384`](https://github.com/BeOnAuto/auto-engineer/commit/4d47384b78e31a030c6ba72bebd30fc4d1558655) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: mark InferredType ketchup plan as complete

- [`f1ceba2`](https://github.com/BeOnAuto/auto-engineer/commit/f1ceba27dcbe380509c43a06d12d449f7abb0f9f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: add ketchup plan for pipeline diagram retry status fix

- [`74b77e4`](https://github.com/BeOnAuto/auto-engineer/commit/74b77e42ae398394871ee6f509f0d3b58afac6e5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: prevent InferredType sentinel leak when type resolution fails
  - **narrative**: strengthen round-trip test assertions with whole-object patterns
  - **narrative**: mark InferredType ketchup plan as complete

- [`22b45c1`](https://github.com/BeOnAuto/auto-engineer/commit/22b45c109222fb7395ebcfad930a08214ce081df) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add ketchup plan for ListType handling + node:crypto fix

## 1.128.2

### Patch Changes

- [`b1af764`](https://github.com/BeOnAuto/auto-engineer/commit/b1af764fd17c33716914902ce01d95b2923735e1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: return persist on settled success path to reset history between batches
  - **global**: version packages

## 1.128.1

### Patch Changes

- [`4f4bd2e`](https://github.com/BeOnAuto/auto-engineer/commit/4f4bd2ec65d2af797b407c0f69b085e6ce30d4d8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **typical**: return persist on settled success path to reset history between batches

- [`f11ee42`](https://github.com/BeOnAuto/auto-engineer/commit/f11ee42d2f4a740a82633fb90109ec6e2a2665ad) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **checks**: remove ESLint code paths, inline runBiome into runLintCheck
  - **global**: version packages
  - **global**: mark all ESLint removal bursts as done in ketchup plan
  - **global**: remove dead eslint-disable comments across packages
  - **global**: remove dead ESLint config references

## 1.128.0

### Minor Changes

- [`86082cc`](https://github.com/BeOnAuto/auto-engineer/commit/86082cc76e63b5b3f7b05ad9cf651715fbbae3f4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add ImageAssetSchema and DesignSchema for enhanced visual representation
  - **pipeline**: update uuid dependency version in package.json and pnpm-lock.yaml
  - **global**: version packages

### Patch Changes

- [`566fc5a`](https://github.com/BeOnAuto/auto-engineer/commit/566fc5aad6626ecaf7906d75f5f9ed4a82674662) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: ketchup plan for removing ESLint remnants after Biome migration

- [`cc5fc0f`](https://github.com/BeOnAuto/auto-engineer/commit/cc5fc0f507e50a4ccf4ec2246980915e597d5dfe) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: remove dead ESLint config references

- [`7fa9b68`](https://github.com/BeOnAuto/auto-engineer/commit/7fa9b688bad495aba923a42613399c5ce95162c4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **checks**: remove ESLint code paths, inline runBiome into runLintCheck

- [`408d14b`](https://github.com/BeOnAuto/auto-engineer/commit/408d14b520f30c73e7ad6b564b71b5076bc2523e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: remove dead eslint-disable comments across packages

- [`41d143c`](https://github.com/BeOnAuto/auto-engineer/commit/41d143c036d3206bf45374bb58627e022c000c33) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark all ESLint removal bursts as done in ketchup plan

## 1.127.0

### Minor Changes

- [`f9352b5`](https://github.com/BeOnAuto/auto-engineer/commit/f9352b5c89c56c861633854c8fa90f16eed90e09) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added image asset and design schemas for enhanced visual representation in narratives

### Patch Changes

- [`dce5b7c`](https://github.com/BeOnAuto/auto-engineer/commit/dce5b7c605de0d818c8c8687730b5f218fd1ea18) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: remove optional marker from projection state fields
  - **global**: version packages

- [`5e1c3fb`](https://github.com/BeOnAuto/auto-engineer/commit/5e1c3fbcd7fcb2c127b93f1dba25fd508dc680bf) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated uuid dependency version to ensure compatibility and stability

## 1.125.1

### Patch Changes

- [`7500c5b`](https://github.com/BeOnAuto/auto-engineer/commit/7500c5bd40cdae5cdf1e02bd26cbc5d6da13dc32) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: prefix unused aggregateStream state var with underscore
  - **server-generator-apollo-emmett**: rename then to thenSends in reactor spec
  - **server-generator-apollo-emmett**: align ReactorLike return type with MessageHandlerResult
  - **server-generator-apollo-emmett**: scaffold full send in register.ts.ejs with multi-event
  - **server-generator-apollo-emmett**: support multiple event-command pairs in react.ts.ejs

- [`6460797`](https://github.com/BeOnAuto/auto-engineer/commit/6460797056f3524e94328a8ca791267476878f5b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: remove optional marker from projection state fields

## 1.125.0

### Minor Changes

- [`7e9da31`](https://github.com/BeOnAuto/auto-engineer/commit/7e9da3151553186c6acd358325606906ae94116a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-implementer**: add shared findFilesToImplement with priority ordering
  - **server-generator-apollo-emmett**: update missed projection spec snapshot
  - **server-implementer**: strengthen system prompt for scaffolded structure
  - **server-generator-apollo-emmett**: add structural guard to projection template
  - **server-generator-apollo-emmett**: use Record<string, never> in state template

### Patch Changes

- [`0ffbeaf`](https://github.com/BeOnAuto/auto-engineer/commit/0ffbeaf7d1c1b4615bc6cec744df54bf98f62d0e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: scaffold full send in register.ts.ejs with multi-event

- [`6914859`](https://github.com/BeOnAuto/auto-engineer/commit/6914859e0a60cc4b0b24c455f257c5a2893d611e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add ketchup plan for typical server generation fixes

- [`f5b94e2`](https://github.com/BeOnAuto/auto-engineer/commit/f5b94e229ec68238fb61d1d082ae5cd1ad6782b8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: create ketchup plan for lint fixes in generated server

- [`e144ca0`](https://github.com/BeOnAuto/auto-engineer/commit/e144ca08e29c980e165ab0bb9272232d66f34024) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fix createFieldUsesJSON false positive for inline objects

- [`497c35f`](https://github.com/BeOnAuto/auto-engineer/commit/497c35f33dd56f43a833faa960023f62242c1ca5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: prefix unused query resolver params with underscore

- [`3b1217f`](https://github.com/BeOnAuto/auto-engineer/commit/3b1217fc85e5c8474e9f40b8008d39e0f1045c99) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: align ReactorLike return type with MessageHandlerResult

- [`15d5f39`](https://github.com/BeOnAuto/auto-engineer/commit/15d5f396b306b46e49f93916ce05bf178ed8b00c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate biome.json with decorator support in server

- [`c65fa28`](https://github.com/BeOnAuto/auto-engineer/commit/c65fa28d49550b879acc8c2cf01be977112cef31) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: rename then to thenSends in reactor spec

- [`039e20c`](https://github.com/BeOnAuto/auto-engineer/commit/039e20c9a4bcba96e26d0a66bf2c138ec6582a23) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: mark all typical server generation fixes as done

- [`13726c4`](https://github.com/BeOnAuto/auto-engineer/commit/13726c4468461a238dec0d6ddcb995c86a40a17b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate biome.json with decorator support in server
  - **server-implementer**: add node: protocol and unused import rules to system prompt
  - **server-generator-apollo-emmett**: fix createFieldUsesJSON false positive for inline objects
  - **server-generator-apollo-emmett**: fix react.ts.ejs template lint violations
  - **server-generator-apollo-emmett**: add ketchup plan for generate+implement run fixes

- [`62442e9`](https://github.com/BeOnAuto/auto-engineer/commit/62442e944bead5717cca971e8f85fd6a98d85e42) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark all lint fix bursts as done in ketchup plan

- [`99a9264`](https://github.com/BeOnAuto/auto-engineer/commit/99a926479988d52164778267cf00f7004673a176) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add node: protocol and unused import rules to system prompt

- [`efc5ac2`](https://github.com/BeOnAuto/auto-engineer/commit/efc5ac29a2a08dff5964087a11be19e4aec6af62) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: support multiple event-command pairs in react.ts.ejs

- [`90b9012`](https://github.com/BeOnAuto/auto-engineer/commit/90b90129eb95e28ff526ef24b5221be0eb0c3d3a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: eliminate any types and dead eslint comments in ReactorLike

- [`0e2d41d`](https://github.com/BeOnAuto/auto-engineer/commit/0e2d41d3b8e0815caecabfdee1e7d6f8d63c4caf) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fix react.ts.ejs template lint violations

- [`4caac94`](https://github.com/BeOnAuto/auto-engineer/commit/4caac94585bb6f9f304d185cd18f79d7d50e36c6) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: mark all generate+implement run fixes as done in ketchup plan

- [`92a0ae9`](https://github.com/BeOnAuto/auto-engineer/commit/92a0ae9a0306a593ea10c8793952fbad5ba5603b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: detect nested inline objects in createFieldUsesJSON

- [`04fd4cb`](https://github.com/BeOnAuto/auto-engineer/commit/04fd4cbbb680b42ab67a2873c5136bf4d853b45a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: prefix unused aggregateStream state var with underscore

## 1.124.0

### Minor Changes

- [`5598a2a`](https://github.com/BeOnAuto/auto-engineer/commit/5598a2a3fc9b0eb012418ad5fec36920a0015045) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: rewrite system prompt with emmett patterns and import rules
  - **server-implementer**: extract shared buildContextSections utility
  - **server-implementer**: extract shared loadContextFiles utility
  - **server-implementer**: change loadSharedContext to return Record<string, string>
  - **server-implementer**: add ketchup plan for generator/implementer hardening

- [`432a674`](https://github.com/BeOnAuto/auto-engineer/commit/432a67401bc2547938173f2a5581b761c7c24457) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add shared findFilesToImplement with priority ordering

### Patch Changes

- [`eadca44`](https://github.com/BeOnAuto/auto-engineer/commit/eadca44c44f5e9b75fc9fae66d116b964635845c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use Date default instead of null in projection specs

- [`6e5085a`](https://github.com/BeOnAuto/auto-engineer/commit/6e5085a538ab40614149d6b2cbf376b51078f661) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: typed variable return pattern in decide template

- [`4c9dcd5`](https://github.com/BeOnAuto/auto-engineer/commit/4c9dcd5cfa2a5fbaba6e04414181dd89f2a7b76b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark all structural fix bursts as done in ketchup plan

- [`91ff56c`](https://github.com/BeOnAuto/auto-engineer/commit/91ff56c6cc7d8b8ead31ea61c52fcaa996c6343e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update missed projection spec snapshot

- [`0281ce0`](https://github.com/BeOnAuto/auto-engineer/commit/0281ce022c94149c093ded3d1f6c1a3cf7aba691) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: strengthen system prompt for scaffolded structure

- [`c081fe8`](https://github.com/BeOnAuto/auto-engineer/commit/c081fe8485b26c5339442c1a19d0e9161061d4cb) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: replace claude with gemini
  - **global**: version packages

- [`396d141`](https://github.com/BeOnAuto/auto-engineer/commit/396d14171aa378396308fd3d7003195ecfa65769) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add structural guard to projection template

- [`e0fc22f`](https://github.com/BeOnAuto/auto-engineer/commit/e0fc22f173ec87502c6fd081653026a43c9b08d8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: update ketchup plan for structural generator/implementer fixes

- [`1dc4f85`](https://github.com/BeOnAuto/auto-engineer/commit/1dc4f85391d843ba423d28332f684296c5bbd8e6) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: remove unused project references from tsconfig.json

- [`3ab3305`](https://github.com/BeOnAuto/auto-engineer/commit/3ab3305b51269affbb2aa678d05e0d410cb3f4fb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: use shared findFilesToImplement in runSlice

- [`e2d3097`](https://github.com/BeOnAuto/auto-engineer/commit/e2d3097e5af288b3f1c69fe1e455a0d2d370e38c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use Record<string, never> in state template

- [`5617b86`](https://github.com/BeOnAuto/auto-engineer/commit/5617b86137edd5a880494d37a8645e4d16dba40f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: use shared findFilesToImplement and extractCodeBlock

## 1.123.0

### Minor Changes

- [`d8f9629`](https://github.com/BeOnAuto/auto-engineer/commit/d8f962940b6cc6da5b16dfc7e5b6a134220b4854) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **app-assembler**: set log level to WARN for Google ADK
  - **global**: version packages

### Patch Changes

- [`ece9a9c`](https://github.com/BeOnAuto/auto-engineer/commit/ece9a9c6cd33109792667437608ec44501591318) Thanks [@osamanar](https://github.com/osamanar)! - - Replaced Claude with Gemini as the AI provider

## 1.122.0

### Minor Changes

- [`d926905`](https://github.com/BeOnAuto/auto-engineer/commit/d9269053f5974c0b65fa2b03c77247b37b459fe5) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **component-implementor-react**: set Google ADK log level to WARN
  - **server-generator-apollo-emmett**: handle zero events in singleton projection template
  - **global**: version packages

- [`ed445b6`](https://github.com/BeOnAuto/auto-engineer/commit/ed445b655132475455f3c047076490b3b7e1d332) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Set Google ADK log level to WARN in app assembler and React component implementor to reduce noisy debug output

## 1.121.0

### Minor Changes

- [`6ebd06e`](https://github.com/BeOnAuto/auto-engineer/commit/6ebd06e82da899695b88debbd20d86a6cb71f3e3) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: set Google ADK log level to WARN

- [`5ccc961`](https://github.com/BeOnAuto/auto-engineer/commit/5ccc96188fae7d3fbeb4a0be52d83b6f4d0a95f4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-implementer**: rewrite system prompt with emmett patterns and import rules
  - **server-implementer**: extract shared buildContextSections utility
  - **server-implementer**: extract shared loadContextFiles utility
  - **server-implementer**: change loadSharedContext to return Record<string, string>
  - **global**: version packages

### Patch Changes

- [`d4ef89b`](https://github.com/BeOnAuto/auto-engineer/commit/d4ef89bc5673409d14a3d5df016f33ad002d6b44) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: handle zero events in singleton projection template

## 1.120.0

### Minor Changes

- [`101e7c0`](https://github.com/BeOnAuto/auto-engineer/commit/101e7c008c9b563b6cf87fd8d2c01c1f95f246f7) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: rewrite system prompt with emmett patterns and import rules

- [`7c6283b`](https://github.com/BeOnAuto/auto-engineer/commit/7c6283bb4734baa271336cc11c1e979c28756e94) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: extract shared buildContextSections utility

- [`cc47f0d`](https://github.com/BeOnAuto/auto-engineer/commit/cc47f0dea9f5b4d9f62fecdc3735d68fedb0e70d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: extract shared loadContextFiles utility

- [`efaab7d`](https://github.com/BeOnAuto/auto-engineer/commit/efaab7d4b2d0eaad96ef8c86326d3cdbc14df4cd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: change loadSharedContext to return Record<string, string>

### Patch Changes

- [`0b8af45`](https://github.com/BeOnAuto/auto-engineer/commit/0b8af45872dd83dec6c8d77153560b481ab864d2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: update ketchup plan for prompt engineering fixes

- [`3894e25`](https://github.com/BeOnAuto/auto-engineer/commit/3894e258aa21423adde8fbf69b7049e19d83a317) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: mark all prompt engineering bursts as done

- [`b21902a`](https://github.com/BeOnAuto/auto-engineer/commit/b21902a2126be94a305e93ed0bee09398b34db56) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: resolve uuid v13 for emmett-sqlite via packageExtensions
  - **global**: version packages

- [`814afef`](https://github.com/BeOnAuto/auto-engineer/commit/814afef92d98bd6b4804aaca3c97ec1c58f3202a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: update runSlice to use shared utilities

- [`37487f4`](https://github.com/BeOnAuto/auto-engineer/commit/37487f4128fb781cd103f49e813fefb4424e2ffd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: update implement-slice to use shared utilities

## 1.119.0

### Minor Changes

- [`d25dc6c`](https://github.com/BeOnAuto/auto-engineer/commit/d25dc6c41ff16c3beacf1a2a46b6b2148486f948) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **diff-patcher**: implement a new diff file writer to optimize llm writes, speed, and tokens
  - **diff-patcher**: add streaming SEARCH/REPLACE parser and edit engine
  - **global**: version packages
  - **diff-patcher**: update pnpm-lock.yaml and remove package-lock.json

### Patch Changes

- [`369e926`](https://github.com/BeOnAuto/auto-engineer/commit/369e926621289c7d2fdfff1c95b499865202ba4e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: resolve uuid v13 for emmett-sqlite via packageExtensions

## 1.118.0

### Minor Changes

- [`55300e0`](https://github.com/BeOnAuto/auto-engineer/commit/55300e07253f3ae471ab6a455d9624d0af315773) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **diff-patcher**: add streaming SEARCH/REPLACE parser and edit engine

- [`d1e66c1`](https://github.com/BeOnAuto/auto-engineer/commit/d1e66c13469855e539750f934e232b5caa9a205b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: imrpoves ui generation pipeline
  - **packages/adk-claude-code-bridge**: fix package not being published
  - **global**: version packages

- [`22bb82a`](https://github.com/BeOnAuto/auto-engineer/commit/22bb82acc4210b35fe5d22c0bb92069555c709b2) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added a new diff-based file writer that optimizes how LLM-generated code changes are applied, reducing token usage and improving write speed

### Patch Changes

- [`d958eba`](https://github.com/BeOnAuto/auto-engineer/commit/d958ebac413b219ff967683fee2334879d2232ea) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **diff-patcher**: update pnpm-lock.yaml and remove package-lock.json

## 1.117.0

### Minor Changes

- [`ffd35da`](https://github.com/BeOnAuto/auto-engineer/commit/ffd35da5602a90907947c0208da9fbd2fb12cbd3) Thanks [@osamanar](https://github.com/osamanar)! - - Improved the UI generation pipeline for better component output

### Patch Changes

- [`40f03c3`](https://github.com/BeOnAuto/auto-engineer/commit/40f03c3e4c468517d917d001bc0ae2fcf4a95a8a) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed package publishing issue for the ADK Claude Code bridge package

- [`cb406c3`](https://github.com/BeOnAuto/auto-engineer/commit/cb406c3c431ea34146e223d5e1f174c9259256ae) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/adk-claude-code-bridge**: adds adk claude code as a package
  - **global**: version packages

## 1.116.0

### Minor Changes

- [`e8a852c`](https://github.com/BeOnAuto/auto-engineer/commit/e8a852c030a4c1ad9f20d4f00b33bf8291da84da) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/adk-claude-code-bridge**: adds adk claude code bridge
  - **global**: version packages

### Patch Changes

- [`24fbfc9`](https://github.com/BeOnAuto/auto-engineer/commit/24fbfc9af6f4de2f402fa0b834d4ef2162af76c5) Thanks [@osamanar](https://github.com/osamanar)! - - Added ADK Claude Code bridge as a new package

## 1.115.0

### Minor Changes

- [`74ec5f3`](https://github.com/BeOnAuto/auto-engineer/commit/74ec5f33c87a58430c39fc695e5f4d162f567e7b) Thanks [@osamanar](https://github.com/osamanar)! - - Added ADK Claude Code bridge package for integrating Google's Agent Development Kit with Claude Code

### Patch Changes

- [`56df6b9`](https://github.com/BeOnAuto/auto-engineer/commit/56df6b971ad5a7f785ff6d4cc08584a7481e1a44) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: remove ketchup plans

## 1.114.0

### Minor Changes

- [`9570b75`](https://github.com/BeOnAuto/auto-engineer/commit/9570b75c9312b6b714e8be89960a5ee7de2d8d48) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: imrpoves ui generation pipeline
  - **component-implementor-react**: rewrite pipeline with parallel gen, fix loops, and evaluation
  - **component-implementor-react**: add test-generation agent
  - **component-implementor-react**: add test-fix agent and loop
  - **component-implementor-react**: add evaluation agent

### Patch Changes

- [`cae4cf2`](https://github.com/BeOnAuto/auto-engineer/commit/cae4cf2f82d363ea696bd6cf9f10d5d35364659f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Removed internal planning files from the repository

## 1.113.0

### Minor Changes

- [`a8150d1`](https://github.com/BeOnAuto/auto-engineer/commit/a8150d1233e13d6e5583683e913d19fc8ccf90fd) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add evaluation agent

- [`d0c76a8`](https://github.com/BeOnAuto/auto-engineer/commit/d0c76a86ad1c5353eec39ed204b8877497f2dae9) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-generation instruction

- [`60cb001`](https://github.com/BeOnAuto/auto-engineer/commit/60cb0010abfd505878cd845eda1063c7eb476be7) Thanks [@osamanar](https://github.com/osamanar)! - - **global**: imrpoves ui generation pipeline
  - **component-implementor-react**: rewrite pipeline with parallel gen, fix loops, and evaluation
  - **component-implementor-react**: add test-generation agent
  - **component-implementor-react**: add test-fix agent and loop
  - **component-implementor-react**: resolve biome lint errors failing CI

- [`409e30b`](https://github.com/BeOnAuto/auto-engineer/commit/409e30b6362fabb14b33fe72cbfc41ab3e089aaa) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-generation instruction

- [`18a308a`](https://github.com/BeOnAuto/auto-engineer/commit/18a308abbed412eef06dc3ddbe3ffe109ebdfc1a) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-generation instruction

- [`ef224d1`](https://github.com/BeOnAuto/auto-engineer/commit/ef224d1fa9c327317b660e85ed924d3eb9fc1499) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-generation agent

- [`18a308a`](https://github.com/BeOnAuto/auto-engineer/commit/18a308abbed412eef06dc3ddbe3ffe109ebdfc1a) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-generation instruction

- [`ba38b4d`](https://github.com/BeOnAuto/auto-engineer/commit/ba38b4de2a5fd531b065ba82a74addd0800cd4c4) Thanks [@osamanar](https://github.com/osamanar)! - - Improved the UI generation pipeline for better component output

- [`dc199cd`](https://github.com/BeOnAuto/auto-engineer/commit/dc199cd34f0ab43fcc6ec55d47460527cc824694) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: rewrite pipeline with parallel gen, fix loops, and evaluation

- [`18a308a`](https://github.com/BeOnAuto/auto-engineer/commit/18a308abbed412eef06dc3ddbe3ffe109ebdfc1a) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add evaluation instruction

- [`496a8fd`](https://github.com/BeOnAuto/auto-engineer/commit/496a8fd4b33b6dfd922b6ff56a78f83528839e7b) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add evaluation instruction

- [`d72af17`](https://github.com/BeOnAuto/auto-engineer/commit/d72af17943c0a649b16b52f584715bffe8a551c7) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-fix agent and loop

### Patch Changes

- [`3b4a9b1`](https://github.com/BeOnAuto/auto-engineer/commit/3b4a9b183688bdaf13d9aeb23455c8cec5ac08c6) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **app-assembler**: add --access public for npm publish
  - **app-assembler**: add release script for npm publish
  - **global**: version packages
  - **global**: version packages

## 1.112.2

### Patch Changes

- [`9b01fa4`](https://github.com/BeOnAuto/auto-engineer/commit/9b01fa49f96d58ffdd74367fa70aa57822520e74) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **app-assembler**: add --access public for npm publish

- [`d8beabc`](https://github.com/BeOnAuto/auto-engineer/commit/d8beabce82313506aeacdf7a4f154ef27af12393) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **app-assembler**: add release script for npm publish
  - **global**: version packages

## 1.112.1

### Patch Changes

- [`abc55fc`](https://github.com/BeOnAuto/auto-engineer/commit/abc55fc2d639132438ab37d7472fc3f9b5e69d15) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **app-assembler**: align version with other packages for npm publish
  - **global**: version packages

- [`50fb06d`](https://github.com/BeOnAuto/auto-engineer/commit/50fb06d06393a5a753f8e272e4aa241dcb9f280f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **app-assembler**: add release script for npm publish

## 1.112.0

### Minor Changes

- [`7ffc5c3`](https://github.com/BeOnAuto/auto-engineer/commit/7ffc5c370b4fc69f67b5b75d9804cc8b9f8ad12c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: improvements
  - **app-assembler**: sort exports
  - **server-generator-apollo-emmett**: remove slice-type guard from findEventSource data.items check
  - **server-generator-apollo-emmett**: extract data.items events for command slices
  - **server-generator-apollo-emmett**: exclude custom input type args from enum imports

### Patch Changes

- [`a13e16d`](https://github.com/BeOnAuto/auto-engineer/commit/a13e16d2de9d3791c29102e936d0f0e8970f0be9) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **app-assembler**: align version with other packages for npm publish

## 1.111.0

### Minor Changes

- [`bb1d999`](https://github.com/BeOnAuto/auto-engineer/commit/bb1d9993bf8e1759f510dc69fb29f29aa78551c6) Thanks [@osamanar](https://github.com/osamanar)! - - Improved overall system functionality and reliability
  - Fixed configuration issues in the typical example setup
  - Updated dependency lock file for consistency

- [`7ce6b69`](https://github.com/BeOnAuto/auto-engineer/commit/7ce6b69f51721efa94401226bdc1df746e2e923b) Thanks [@osamanar](https://github.com/osamanar)! - - Improvements across the project

### Patch Changes

- [`7f19f4d`](https://github.com/BeOnAuto/auto-engineer/commit/7f19f4d1bbd91f0c5800aea47d726ba652d742ce) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan — mark fixes 9-11 complete

- [`500ec1a`](https://github.com/BeOnAuto/auto-engineer/commit/500ec1a8101687408b91101f774dcc78c9c1b800) Thanks [@osamanar](https://github.com/osamanar)! - - Removed AI-generated comments from React component implementation output

- [`ffbbb2c`](https://github.com/BeOnAuto/auto-engineer/commit/ffbbb2cdf59ed184407886a58fb6fc7cacbefd92) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: remove schema.graphql references from pipeline and app-implementer

- [`c17f465`](https://github.com/BeOnAuto/auto-engineer/commit/c17f465bd93fe614a64bf4dfd2e3bd2765d362f4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: npm install issue
  - **global**: update biome command and add DEPS_PRE_WARMED check
  - **global**: version packages

- [`02c8ded`](https://github.com/BeOnAuto/auto-engineer/commit/02c8ded9279b6a4017e09e1e0d0a48fd71f51b15) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: extract data.items events for command slices

- [`5143dc5`](https://github.com/BeOnAuto/auto-engineer/commit/5143dc57bbe4014d55e92b5d5c10bf37fc73b1c3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: exclude custom input type args from enum imports

- [`ec342da`](https://github.com/BeOnAuto/auto-engineer/commit/ec342daf65ee36d33a510ad454ba3e908c8f8bad) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: remove slice-type guard from findEventSource data.items check

- [`d3e6002`](https://github.com/BeOnAuto/auto-engineer/commit/d3e60020228270c2cae2b8ac62ebc05362182ace) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-nestjs**: remove contextSchemaGraphQL from ServerGeneratedEvent

- [`2f49710`](https://github.com/BeOnAuto/auto-engineer/commit/2f49710dfd56279c2eee7f95178e7d9cefc5d680) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: remove generate-schema template and update READMEs

- [`c651bb9`](https://github.com/BeOnAuto/auto-engineer/commit/c651bb9b7d2b9d413991d45e141e9420611ea2b1) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: remove misleading "valid" qualifier from test descriptions

- [`b74aa8b`](https://github.com/BeOnAuto/auto-engineer/commit/b74aa8b743678cba6150e180551bbe768f2e633f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed export ordering in app assembler to ensure consistent and deterministic output

- [`e3999db`](https://github.com/BeOnAuto/auto-engineer/commit/e3999db87041cc4368558bdb9a373bc158133ec2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan for round 3 fixes 9-11

- [`27388d5`](https://github.com/BeOnAuto/auto-engineer/commit/27388d556143ae2e33cf35ffd473150e72accae2) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed auto configuration in the typical example project

- [`720e9cd`](https://github.com/BeOnAuto/auto-engineer/commit/720e9cd32eead2a5af0c96dbcec8f2427f6c5676) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: map custom GraphQL input type args to GraphQLJSON

- [`3eb5840`](https://github.com/BeOnAuto/auto-engineer/commit/3eb58407bacfd13535ad2486caed1f1722a95d5c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: remove GraphQL schema generation

## 1.110.7

### Patch Changes

- [`6a15824`](https://github.com/BeOnAuto/auto-engineer/commit/6a1582475305b998959a28c9fed730d52bc8941f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed an npm install issue

- [`35a054d`](https://github.com/BeOnAuto/auto-engineer/commit/35a054dce282d69e97ab29cd08098d62f2dfc13d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: add lodash-es dependency for improved functionality
  - **global**: version packages

- [`55f4848`](https://github.com/BeOnAuto/auto-engineer/commit/55f48484122daaacbdf312720745c48a49a988ec) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated biome command configuration for improved linting
  - Added dependency pre-warming check to optimize build performance

## 1.110.6

### Patch Changes

- [`f64d5e5`](https://github.com/BeOnAuto/auto-engineer/commit/f64d5e563efee5740513012ba1de1fe95e0a67ea) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: include additional dependencies for optimization
  - **server-generator-apollo-emmett**: exclude query arg fields from projection spec expected state
  - **server-generator-apollo-emmett**: add CONSTRAINTS block to evolve.ts template
  - **server-generator-apollo-emmett**: broaden cast prohibition and add field constraint in decide.ts
  - **server-generator-apollo-emmett**: add CONSTRAINTS block to register.ts template

- [`1601973`](https://github.com/BeOnAuto/auto-engineer/commit/1601973e8459554a7f7af80821830e1391ba3709) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added lodash-es dependency to the typical package for improved functionality

## 1.110.5

### Patch Changes

- [`0e1e74c`](https://github.com/BeOnAuto/auto-engineer/commit/0e1e74ce67838d17108d50173d7f435d38307fca) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add test for query arg exclusion with differing values

- [`31f4711`](https://github.com/BeOnAuto/auto-engineer/commit/31f47112be977b55d13bfcf24f3c38f5511d8307) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add ketchup plan for projection spec query arg fix

- [`24756e3`](https://github.com/BeOnAuto/auto-engineer/commit/24756e3c626032108e0a7d4fb5e9fa4792853f53) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: increase express.json body size limit to 10mb
  - **server-implementer**: exclude spec files from AI context in implement-slice
  - **server-generator-apollo-emmett**: enrich missing event data in react specs template

- [`bf35e68`](https://github.com/BeOnAuto/auto-engineer/commit/bf35e68a2e76d6943c97c5036b899b087bc68a32) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add CONSTRAINTS block to evolve.ts template

- [`437d8cc`](https://github.com/BeOnAuto/auto-engineer/commit/437d8ccd999f8a6dd606f1b3767c9c3af7d11edf) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **pipeline**: remove redundant client checks from pipeline events

- [`9e2ccac`](https://github.com/BeOnAuto/auto-engineer/commit/9e2ccacccff33c9693829178af4eab28cf709e9f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: exclude query arg fields from projection spec expected state

- [`d5d7a36`](https://github.com/BeOnAuto/auto-engineer/commit/d5d7a368505d6450909589c43bf8033a11e55e5a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add CONSTRAINTS block to react.ts template

- [`8be0b53`](https://github.com/BeOnAuto/auto-engineer/commit/8be0b53f9e6f51aeb4759e461e8511de3c601885) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: add ketchup plan for post-implementation fixes round 2

- [`b2614ef`](https://github.com/BeOnAuto/auto-engineer/commit/b2614ef82c97b4766fdc606737ae6d5ab481c2e5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark all round 2 fix bursts as done in ketchup plan

- [`142abac`](https://github.com/BeOnAuto/auto-engineer/commit/142abacab3ea4e0357372850ff8bdf0b55cd8f7a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add CONSTRAINTS block to projection.ts and fix cast guidance

- [`9684c1f`](https://github.com/BeOnAuto/auto-engineer/commit/9684c1f1e45791b7bc6542229ef48ca76b8eef80) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed missing dependencies in React client generation to ensure proper optimization support

- [`aa189ea`](https://github.com/BeOnAuto/auto-engineer/commit/aa189eaa1d6309126c2554b717ddd51cc11b16b7) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: broaden cast prohibition and add field constraint in decide.ts

- [`4646433`](https://github.com/BeOnAuto/auto-engineer/commit/4646433ec25262d042001e5fd127a9b24003dfea) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: filter command .when() data to schema fields in decide.specs

- [`b64ef2e`](https://github.com/BeOnAuto/auto-engineer/commit/b64ef2e679462a8389b27e7fd0b59d2db516d10f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use NOTE instead of TODO for non-matching query args

- [`3b0afad`](https://github.com/BeOnAuto/auto-engineer/commit/3b0afad3754c7a89bfb5c83fab8138ca97eb7b21) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add CONSTRAINTS block to register.ts template

## 1.110.4

### Patch Changes

- [`41cb3f7`](https://github.com/BeOnAuto/auto-engineer/commit/41cb3f7b769895ccd00c1f97c73834ac7565ba06) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Simplified pipeline event handling by removing unnecessary client validation checks

- [`18d5e47`](https://github.com/BeOnAuto/auto-engineer/commit/18d5e47440ba4a21ab7c09f920b514b328a2f564) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **pipeline**: simplify component handling and enhance client implementation
  - **pipeline**: restore lint, type, test, and story fix loops

## 1.110.3

### Patch Changes

- [`74bb7a6`](https://github.com/BeOnAuto/auto-engineer/commit/74bb7a6f4ad0860437189072c053801d5e4b8293) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Simplified how components are handled in the pipeline
  - Enhanced the client implementation for improved reliability

- [`751d711`](https://github.com/BeOnAuto/auto-engineer/commit/751d711d16bc5c0148cd929a2576dfc59871fec4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-implementer**: exclude spec files from AI context in implement-slice
  - **server-generator-apollo-emmett**: enrich missing event data in react specs template
  - **server-generator-apollo-emmett**: validate query args against state fields in resolver
  - **server-generator-apollo-emmett**: per-variable stream ID classification in handle.ts
  - **server-generator-apollo-emmett**: filter non-events from query when-events

- [`8ff54ee`](https://github.com/BeOnAuto/auto-engineer/commit/8ff54ee75f4bb1d419285c5a1a6a9359176e56b8) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Restored lint, type-checking, test, and story fix loops in the pipeline

## 1.110.2

### Patch Changes

- [`28e4df1`](https://github.com/BeOnAuto/auto-engineer/commit/28e4df126f9f013cd5935d1ff5b0c951a5330944) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: validate query args against state fields in resolver

- [`00663f6`](https://github.com/BeOnAuto/auto-engineer/commit/00663f675720f1dc0e65aff1f869a6fc548ebd77) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: ketchup plan for scaffold & implementer fixes

- [`1059e28`](https://github.com/BeOnAuto/auto-engineer/commit/1059e2844a21c7e12727baddac9afec50c0171f9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: per-variable stream ID classification in handle.ts

- [`1291a9a`](https://github.com/BeOnAuto/auto-engineer/commit/1291a9a13bd0273096e7abaa8d8d3457037a5278) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: filter non-events from query when-events

- [`66db309`](https://github.com/BeOnAuto/auto-engineer/commit/66db309ac4a86ecae807fe636867e862d5390bc1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **component-implementor-react**: issue with missing imports in starter + improve story generation
  - **global**: version packages

- [`aa43d9b`](https://github.com/BeOnAuto/auto-engineer/commit/aa43d9b0c1e6d00d5129a848e316d1447734b80f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: exclude spec files from AI context in implement-slice

- [`8f2c4fd`](https://github.com/BeOnAuto/auto-engineer/commit/8f2c4fd19c09b27efac4fd4735778f25d3554473) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: enrich missing event data in react specs template

## 1.110.1

### Patch Changes

- [`4b7274b`](https://github.com/BeOnAuto/auto-engineer/commit/4b7274b9eb2900c20764fb460c18fd004b819d1e) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed missing imports in React component starter template
  - Improved story generation for React components

- [`a36c138`](https://github.com/BeOnAuto/auto-engineer/commit/a36c1387cd61e33ad5097fe8fdd9305706b3c386) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: include process output in waitForHttp error messages
  - **global**: version packages

## 1.110.0

### Minor Changes

- [`b98a16e`](https://github.com/BeOnAuto/auto-engineer/commit/b98a16e1021c333f5c7dfbdcf93a0f8593226290) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: add biome.json to server scaffold
  - **checks**: add type checking command and related functionality
  - **typical**: emit graph completion events from component settled handler
  - **pipeline**: wire onEmit callback in pipeline-server for settled handlers
  - **pipeline**: wire emit closure in v2-runtime-bridge handleOutputs

### Patch Changes

- [`acd9e95`](https://github.com/BeOnAuto/auto-engineer/commit/acd9e95c011a2a8617aaa3fe25761dd87fce4e36) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: include process output in waitForHttp error messages

## 1.109.0

### Minor Changes

- [`044c1f4`](https://github.com/BeOnAuto/auto-engineer/commit/044c1f419eac3d3b039d081bb46751773a2e84f4) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: add biome.json to server scaffold

- [`9fc04f2`](https://github.com/BeOnAuto/auto-engineer/commit/9fc04f2bee9491938507d714dc650d53f44c1ae0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: wire onEmit callback in pipeline-server for settled handlers

- [`7cac678`](https://github.com/BeOnAuto/auto-engineer/commit/7cac67806fadba1f9f12f9428f79f8cc49e5c140) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: template fallback for broken pnpm
  - **generate-react-client**: fall back to /app/.templates/client when package starter missing
  - **global**: version packages

- [`63595e9`](https://github.com/BeOnAuto/auto-engineer/commit/63595e96999aac292235c9e6f9b459fc960a5f6e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add emit parameter to SettledHandler type

- [`63563c0`](https://github.com/BeOnAuto/auto-engineer/commit/63563c023df2fa8f9e0287e5ef7902afc04e85a4) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added type checking command to validate code correctness within the pipeline

- [`8c4c153`](https://github.com/BeOnAuto/auto-engineer/commit/8c4c153daeb14687108fad88b36085cc79ba34f6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: emit graph completion events from component settled handler

- [`1a87d2d`](https://github.com/BeOnAuto/auto-engineer/commit/1a87d2d6fea9214e1e5898c73b026dd8f6cd9346) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **job-graph-processor**: skip intermediate events in classifyJobEvent
  - **pipeline**: always use sessionId for settled correlationId tracking

- [`2ba8209`](https://github.com/BeOnAuto/auto-engineer/commit/2ba8209947f9bc49367333ade1681fdc12386645) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **checks**: add type checking command and related functionality
  - **pipeline**: add explicit return type to createPipelineServerV2
  - **typical**: prevent check events from reaching graph processor
  - **pipeline**: improve readability of correlation ID handling and command sending
  - **global**: update plan with check correlationId fix

- [`8467751`](https://github.com/BeOnAuto/auto-engineer/commit/8467751c7cb26edf1e0ad10a97f8b2e6358def4c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: wire emit closure in v2-runtime-bridge handleOutputs

### Patch Changes

- [`5d7c10e`](https://github.com/BeOnAuto/auto-engineer/commit/5d7c10edff9ff46548295f91e2482f7e62604562) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: mark all graph dispatch fix bursts complete

- [`62419a4`](https://github.com/BeOnAuto/auto-engineer/commit/62419a4aebac40eb1958d5f551094312dfbf939a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: format implement-component test file

- [`c293cc3`](https://github.com/BeOnAuto/auto-engineer/commit/c293cc33a10290bfde2d4f87925c12d4804d8e30) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: prevent check events from reaching graph processor

- [`bf80607`](https://github.com/BeOnAuto/auto-engineer/commit/bf806073a32113ea8071bdbb67d2df17efd70788) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Improved readability of correlation ID handling and command sending in the pipeline

- [`916190b`](https://github.com/BeOnAuto/auto-engineer/commit/916190b6bf174533cd341a04fd331f7a76785922) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: update plan with check correlationId fix

- [`4cd7af8`](https://github.com/BeOnAuto/auto-engineer/commit/4cd7af857d1b5f1bb5c06d5de91014d9052bc4f3) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: disable useIgnoreFile in biome config

- [`3839b10`](https://github.com/BeOnAuto/auto-engineer/commit/3839b10ae615eeb925ee4630f9d2641084c40fee) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: format pipeline files to pass biome check

## 1.108.0

### Minor Changes

- [`c3ff53a`](https://github.com/BeOnAuto/auto-engineer/commit/c3ff53a662b8574254cebe211d3dc7e8e6d40ce0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: fall back to /app/.templates/client when package starter missing

- [`b3012ba`](https://github.com/BeOnAuto/auto-engineer/commit/b3012ba87dcfa159bcb2ec28e8b36a27512903d6) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: add descriptive labels to settled
  - **pipeline**: allow custom label on settled() builder method
  - **pipeline**: thread sourceEventType from event routing to settled bridge
  - **pipeline**: capture sourceEventTypes from emit chain in settled builder
  - **pipeline**: filter settled bridge events by sourceEventTypes

- [`cb76057`](https://github.com/BeOnAuto/auto-engineer/commit/cb760571ccc5445a0b6cc0dd69b7476404db6111) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: template fallback for broken pnpm

## 1.107.0

### Minor Changes

- [`8bedd2d`](https://github.com/BeOnAuto/auto-engineer/commit/8bedd2d23673f475aa11d41c4ecc49c6cf116544) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: capture sourceEventTypes from emit chain in settled builder

- [`55d254f`](https://github.com/BeOnAuto/auto-engineer/commit/55d254f5cba939d8da86b59e2988fbd6015a4b99) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: allow custom label on settled() builder method

- [`4c00021`](https://github.com/BeOnAuto/auto-engineer/commit/4c00021fdb4f4e07e071825c61b1b2a6e53dee32) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added descriptive labels to settled operations for better identification and debugging

- [`35f4746`](https://github.com/BeOnAuto/auto-engineer/commit/35f474680de0972db431720f7bbec37e7acf1474) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: wire component check-and-retry loop
  - **component-implementor-react**: add context and passthrough fields
  - **pipeline**: support multiple settled blocks with same command types
  - **component-implementor-react**: remove context from CLI fields definition
  - **pipeline**: update graph node IDs and mermaid rendering for settledId

- [`c014d49`](https://github.com/BeOnAuto/auto-engineer/commit/c014d4975c1684484e2616894534b99199d46883) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: thread sourceEventType from event routing to settled bridge

- [`444e0e5`](https://github.com/BeOnAuto/auto-engineer/commit/444e0e5f2c1e7ed95b954f26ca057185fe415a84) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: auto-generate label for settled graph nodes from dispatches

- [`bf5ab79`](https://github.com/BeOnAuto/auto-engineer/commit/bf5ab79d1d03e16b5d073a2d92704f3b7a7d922c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: filter settled bridge events by sourceEventTypes

### Patch Changes

- [`0315167`](https://github.com/BeOnAuto/auto-engineer/commit/0315167729236a9a93dc71676f412aea90b4812e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: mark settled labels and event routing bursts as done

- [`4f20028`](https://github.com/BeOnAuto/auto-engineer/commit/4f200282507647e4782bb88bfbe15a47c1d45e68) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add settled labels and event routing plan to ketchup

## 1.106.0

### Minor Changes

- [`18bad3a`](https://github.com/BeOnAuto/auto-engineer/commit/18bad3ac3cc3159d5b8b8c248d6b9490e4c2c687) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: wire component check-and-retry loop
  - **component-implementor-react**: add context and passthrough fields
  - **component-implementor-react**: remove context from CLI fields definition

- [`d09910b`](https://github.com/BeOnAuto/auto-engineer/commit/d09910ba97b7aee665dfa149912633d5e2c5a422) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: support multiple settled blocks with same command types

- [`635e44c`](https://github.com/BeOnAuto/auto-engineer/commit/635e44c855cb94e44d0551ced2314dbb69bb81ef) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: generate target().event() calls in flow code generator
  - **narrative**: add target() builder factory for target-only event items
  - **narrative**: add DataTargetSchema for target-only event items
  - **global**: pass flowName/sliceName/sliceType in ServerGenerationFailed bug report
  - **server-generator-apollo-emmett**: enrich ServerGenerationFailed with cause-chain context

### Patch Changes

- [`bafafb5`](https://github.com/BeOnAuto/auto-engineer/commit/bafafb5d3b7301e377ac6defb3bc9ee7dbb32e2d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: update graph node IDs and mermaid rendering for settledId

## 1.105.0

### Minor Changes

- [`757b847`](https://github.com/BeOnAuto/auto-engineer/commit/757b847511f6b4a6d3b585bf02a45bce70c6c29c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add target() builder factory for target-only event items

- [`057c6e5`](https://github.com/BeOnAuto/auto-engineer/commit/057c6e56e45e63158708cb05c5dda3b6ca863a92) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: generate target().event() calls in flow code generator

- [`ae3527b`](https://github.com/BeOnAuto/auto-engineer/commit/ae3527b42a82a794763109082e539681fd0d289a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: pass flowName/sliceName/sliceType in ServerGenerationFailed bug report

- [`0888604`](https://github.com/BeOnAuto/auto-engineer/commit/0888604e72107d5790c7b72eaa5213588e39aa4a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: replace merge with component-parser
  - **component-parser**: parseManifestComponents deduplicates and parses component paths
  - **component-parser**: add Card.tsx tests verifying pure HTML wrappers have empty props
  - **component-parser**: add Carousel.tsx tests for separate type def and custom prop survival
  - **component-parser**: parseComponentFile extracts Button props

- [`b3583e3`](https://github.com/BeOnAuto/auto-engineer/commit/b3583e35a52c4d311bd04b3df4a8c34e856b4f3c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add error classes with cause chain for scaffold failures

- [`048b477`](https://github.com/BeOnAuto/auto-engineer/commit/048b4774960e2e186599ebc1c7654285677fd05b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: enrich ServerGenerationFailed with cause-chain context

- [`81188d6`](https://github.com/BeOnAuto/auto-engineer/commit/81188d6b9bc51761a9bc52eef211bde3cc49fcc9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add DataTargetSchema for target-only event items

### Patch Changes

- [`933d724`](https://github.com/BeOnAuto/auto-engineer/commit/933d724c2348048116e173d056ddfe54a9ddfa65) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fix decide default case + add union narrowing guidance

- [`8c6ea86`](https://github.com/BeOnAuto/auto-engineer/commit/8c6ea861fd7c43331de117abca84dff23e3424ff) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use EntityData indexed access for singleton \_entities typing
  - **server-generator-apollo-emmett**: remove misleading Command targets from react DT test fixtures
  - **server-generator-apollo-emmett**: strengthen evolve template TODO and implementer guidance
  - **server-generator-apollo-emmett**: return 0 for non-numeric values in number type formatter
  - **server-implementer**: add strict array/object typing rules to prompts

- [`8dbc585`](https://github.com/BeOnAuto/auto-engineer/commit/8dbc5852bd4a1fa09d3290970a802d17937614ed) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: finalize ketchup plan for DataTarget feature

- [`767d3d6`](https://github.com/BeOnAuto/auto-engineer/commit/767d3d629dcc889eee15be8922d146f90edc5e8d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: strengthen evolve template TODO and implementer guidance

- [`ee6f943`](https://github.com/BeOnAuto/auto-engineer/commit/ee6f943e8063104b37ad7bb7d566c1bbcd683176) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: move discriminant rules from system prompts to templates

- [`049c2be`](https://github.com/BeOnAuto/auto-engineer/commit/049c2bea133f3e180340e617b5cb29044a484043) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: ketchup plan for DataTarget schema feature

- [`0573d9c`](https://github.com/BeOnAuto/auto-engineer/commit/0573d9c3cadb0644c3763e8ff5a6e93cc097e149) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark bursts 29-30 done in ketchup plan

- [`61f720c`](https://github.com/BeOnAuto/auto-engineer/commit/61f720cd00902678ef87cc601ba55122a91b1583) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: move discriminant rules from system prompts to templates
  - **server-generator-apollo-emmett**: use EntityData indexed access for singleton \_entities typing
  - **server-generator-apollo-emmett**: remove misleading Command targets from react DT test fixtures
  - **server-generator-apollo-emmett**: strengthen evolve template TODO and implementer guidance
  - **server-generator-apollo-emmett**: return 0 for non-numeric values in number type formatter

- [`5a97de3`](https://github.com/BeOnAuto/auto-engineer/commit/5a97de3c314256bb98312c120bca009e8cb4ef22) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add stream guard for multi-command slices

- [`c62ffe2`](https://github.com/BeOnAuto/auto-engineer/commit/c62ffe2636977f552c9147f7be55b8c0e89e5302) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: remove misleading Command targets from react DT test fixtures

- [`cb39fea`](https://github.com/BeOnAuto/auto-engineer/commit/cb39fea922ebd6b8b21fdd735daadba04c845372) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark bursts 27-28 done in ketchup plan

- [`7b21d43`](https://github.com/BeOnAuto/auto-engineer/commit/7b21d43806e395ce5efd558cf0897fe35015f749) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add strict array/object typing rules to prompts

- [`db4a3c3`](https://github.com/BeOnAuto/auto-engineer/commit/db4a3c310f15d148ac15a10e8001b17e6c5cfb27) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **component-parser**: memoize buildHtmlPropSet per Project to fix CI timeout

- [`472ce61`](https://github.com/BeOnAuto/auto-engineer/commit/472ce619aa8ecb6926316e3232010b8b162112e0) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: bump tsconfig lib for Error.cause support

- [`f151090`](https://github.com/BeOnAuto/auto-engineer/commit/f1510900832e08508a319f9f85638c32e7ef86cb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: return 0 for non-numeric values in number type formatter

## 1.104.0

### Minor Changes

- [`78976f5`](https://github.com/BeOnAuto/auto-engineer/commit/78976f5df70cec2320f548f08d4b950bda1c5063) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: extractDefaults extracts destructuring defaults

- [`ad74fec`](https://github.com/BeOnAuto/auto-engineer/commit/ad74fecdba40dff69a57c1fb5c0b36e7de40df35) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: buildHtmlPropSet resolves HTML div prop names

- [`4ca9d54`](https://github.com/BeOnAuto/auto-engineer/commit/4ca9d5434af53f9bbffa6d8af61082534693cbd2) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: add Card.tsx tests verifying pure HTML wrappers have empty props

- [`4ca9d54`](https://github.com/BeOnAuto/auto-engineer/commit/4ca9d5434af53f9bbffa6d8af61082534693cbd2) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: add Card.tsx tests verifying pure HTML wrappers have empty props

- [`8d4a3d1`](https://github.com/BeOnAuto/auto-engineer/commit/8d4a3d1c992ce35e390260007e1575052df4bc39) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: resolveCustomProps filters HTML props from component type

- [`4ca9d54`](https://github.com/BeOnAuto/auto-engineer/commit/4ca9d5434af53f9bbffa6d8af61082534693cbd2) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: add Card.tsx tests verifying pure HTML wrappers have empty props

- [`fb635c1`](https://github.com/BeOnAuto/auto-engineer/commit/fb635c1b23a1ad472e76604ad9ee502c8ebe453e) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: add Carousel.tsx tests for separate type def and custom prop survival

- [`21f0490`](https://github.com/BeOnAuto/auto-engineer/commit/21f04909e0378673fe94180d3ff081e222120580) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: parseManifestComponents deduplicates and parses component paths

- [`98d70d8`](https://github.com/BeOnAuto/auto-engineer/commit/98d70d8116ec8e87bee34aa1e506ef77fa8ffd37) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: parseComponentFile extracts Button props

- [`27df054`](https://github.com/BeOnAuto/auto-engineer/commit/27df054af29a314fdacef7dec2ffb15748d61036) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: createProject returns ts-morph Project from tsconfig

- [`4e58f58`](https://github.com/BeOnAuto/auto-engineer/commit/4e58f5859d4df96ff9944ec7411606769aaa38ff) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **component-implementor-react**: add toHaveStyle and ReferenceError fix guidance to test fixer
  - **component-implementor-react**: strengthen mock spy expect.anything() requirement in test rule 16
  - **component-implementor-react**: add mock spy argument count fix to test fixer
  - **component-implementor-react**: add semantic HTML role mapping test rule
  - **component-implementor-react**: add array key rule and strengthen noArrayIndexKey lint fixer

- [`8fc425d`](https://github.com/BeOnAuto/auto-engineer/commit/8fc425d6c53ed4bac3739f703edbd788eb1e3397) Thanks [@osamanar](https://github.com/osamanar)! - - Added component-parser package that extracts and deduplicates component props, filtering out standard HTML attributes to surface only custom props
  - Replaced client-side component merging with server-side approach using the new component-parser, simplifying the React client build pipeline
  - Fixed components database not being properly built in generate-react-client
  - Fixed out-of-date package lock

- [`48a7155`](https://github.com/BeOnAuto/auto-engineer/commit/48a7155ccdfca8ad58028564d821902e2d1c7b0d) Thanks [@osamanar](https://github.com/osamanar)! - - **generate-react-client**: replace merge with component-parser

- [`4ca9d54`](https://github.com/BeOnAuto/auto-engineer/commit/4ca9d5434af53f9bbffa6d8af61082534693cbd2) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: add Accordion.tsx tests for Radix prop survival

### Patch Changes

- [`f5be819`](https://github.com/BeOnAuto/auto-engineer/commit/f5be8199bbcc358dd2f5d9940e404a55b32ef853) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed an issue where the components database was not being properly built during React client generation

- [`6f72c42`](https://github.com/BeOnAuto/auto-engineer/commit/6f72c4259c96da831e72348de005ff6e70140b61) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed failing tests across the project

- [`a5615d9`](https://github.com/BeOnAuto/auto-engineer/commit/a5615d944a1836d80722452c50f10c955a664a90) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: mark all bursts complete in ketchup plan

- [`47a13ab`](https://github.com/BeOnAuto/auto-engineer/commit/47a13abe754ef572cedb578ef61bb3b1c07961e8) Thanks [@osamanar](https://github.com/osamanar)! - - **component-parser**: scaffold @xolvio/component-parser package

## 1.103.0

### Minor Changes

- [`bc1198f`](https://github.com/BeOnAuto/auto-engineer/commit/bc1198f08c77b1ef923c03de54b46d90737e3511) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: capture suite-level errors in test-runner

- [`ea18f02`](https://github.com/BeOnAuto/auto-engineer/commit/ea18f02739cb60f6daa7817bfe2479d2d6f1161e) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add mock spy argument count fix to test fixer

- [`cdd9e6c`](https://github.com/BeOnAuto/auto-engineer/commit/cdd9e6c29fcca8c4e030b5f5effbbb977ca5b208) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add controlled input initialization rule

- [`9e2b024`](https://github.com/BeOnAuto/auto-engineer/commit/9e2b0245ecb86d0c26b5cf4defe8028a48f4691f) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add --config-path to biome commands

- [`ba0bc57`](https://github.com/BeOnAuto/auto-engineer/commit/ba0bc57142ad5308e20e8f7b10b39189a76a61bb) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add semantic HTML role mapping test rule

- [`27d282b`](https://github.com/BeOnAuto/auto-engineer/commit/27d282bb0b5cbb4e2c84a392d10302e49a89dd4b) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: strengthen mock spy expect.anything() requirement in test rule 16

- [`68b32be`](https://github.com/BeOnAuto/auto-engineer/commit/68b32beacda7e8f6ed08f89dbbbca14292cce2b6) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add toHaveStyle and ReferenceError fix guidance to test fixer

- [`d06922f`](https://github.com/BeOnAuto/auto-engineer/commit/d06922fef1709c4bbb2e854721c3258ff555db05) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: refine mock pattern and add noArrayIndexKey lint guidance

- [`523345a`](https://github.com/BeOnAuto/auto-engineer/commit/523345a1a43fa68abef2e23bceb792409dbc637d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: reset command kills servers on ports 4000, 6006, 8080
  - **global**: version packages
  - **dev-server**: mark reset port killing bursts as done
  - **dev-server**: add reset port killing bursts to plan

- [`7b1c878`](https://github.com/BeOnAuto/auto-engineer/commit/7b1c8780ffd388681ff349f0318cae2c924c1d6c) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add vi.mock hoisting rule and hoisting fix guidance

- [`29d2b25`](https://github.com/BeOnAuto/auto-engineer/commit/29d2b25a39949006a82f04678dc0db8081e2fe83) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add array key rule and strengthen noArrayIndexKey lint fixer

- [`f52bdf0`](https://github.com/BeOnAuto/auto-engineer/commit/f52bdf08a8222f92a4b826640911ca9dc0fd01e7) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add import constraint and jsdom rules to prompts

- [`034f8ee`](https://github.com/BeOnAuto/auto-engineer/commit/034f8eea9b6eef1c292ca3d617178b857a111739) Thanks [@osamanar](https://github.com/osamanar)! - Based on the actual changes, here's the changelog:
  - Added granular fix iteration tracking per pipeline step (type, test, lint, and story fixes are now tracked individually)
  - Added batch generation script to process multiple component models from input specifications
  - Improved pipeline result reporting with detailed per-step iteration counts

- [`1028b73`](https://github.com/BeOnAuto/auto-engineer/commit/1028b7305decbfadc939c87b5b5c0a912f5fa574) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test isolation and class assertion rules

- [`31280e0`](https://github.com/BeOnAuto/auto-engineer/commit/31280e01e48c5573c8cb6bfcf1f3efc780363628) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: re-run biome auto-fix after each LLM write in lint-fix-loop

### Patch Changes

- [`9bf4bf8`](https://github.com/BeOnAuto/auto-engineer/commit/9bf4bf82ddbd110731df2f6c3095f62f3c45aa11) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: update generate-all script

- [`04df477`](https://github.com/BeOnAuto/auto-engineer/commit/04df477740a82fbb4cc25235de67e223c1820deb) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: increase maxTestFixIterations to 5

- [`a083a3f`](https://github.com/BeOnAuto/auto-engineer/commit/a083a3f461bdd207ff5ae5f31747b26c9ea64425) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: use mock.calls direct access for spy assertions

- [`08dd627`](https://github.com/BeOnAuto/auto-engineer/commit/08dd62738c3dbae11947c1c1f459bbf4d7007a2c) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: increase fix iteration limits

## 1.102.0

### Minor Changes

- [`36a3919`](https://github.com/BeOnAuto/auto-engineer/commit/36a39194e3d9a86fabec2e586441293d6f27de8e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: reset command kills servers on ports 4000, 6006, 8080

- [`933629e`](https://github.com/BeOnAuto/auto-engineer/commit/933629e183d4a8eb9fe0c50ae4187dd5a9aff44b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: fixes build
  - **global**: fixes build
  - **global**: version packages

### Patch Changes

- [`bf9a985`](https://github.com/BeOnAuto/auto-engineer/commit/bf9a985c5fc2539cb6a4ea5c14f68a5d3a6c4061) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: add reset port killing bursts to plan

- [`f2b5a78`](https://github.com/BeOnAuto/auto-engineer/commit/f2b5a78822ebe04cc138f066023702108f6da27d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: mark reset port killing bursts as done

## 1.101.0

### Minor Changes

- [`542dbd6`](https://github.com/BeOnAuto/auto-engineer/commit/542dbd699d818404d6832c439cdb3f9693fa876e) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed build issues across the project

- [`9e2d1c3`](https://github.com/BeOnAuto/auto-engineer/commit/9e2d1c38678579c8afdb953a1cda4734ed826c67) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed build issues across the project

- [`795da53`](https://github.com/BeOnAuto/auto-engineer/commit/795da5366f2f25b6c93bee158fb3dd79f68c520f) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add @react-spring packages and update versions
  - **global**: version packages

## 1.100.0

### Minor Changes

- [`9d73da8`](https://github.com/BeOnAuto/auto-engineer/commit/9d73da80b44a3567685c15c5b0c2d4f4bb355323) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added @react-spring animation packages for smoother UI transitions and animations

- [`3371bd0`](https://github.com/BeOnAuto/auto-engineer/commit/3371bd0d6d93e3192c12cb01c1e012d0edd18fe3) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: fixes build
  - **component-implementor-react**: wire implement-component to TDD pipeline
  - **component-implementor-react**: add pipeline runner
  - **component-implementor-react**: add visual-test pipeline step
  - **component-implementor-react**: add storybook-test pipeline step

## 1.99.0

### Minor Changes

- [`dbd0fa9`](https://github.com/BeOnAuto/auto-engineer/commit/dbd0fa96c77a1d43494d4f4c89975bcfd0a9a191) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: wire implement-component to TDD pipeline

- [`88a2432`](https://github.com/BeOnAuto/auto-engineer/commit/88a24329bef929901b924aed0c570e5eca2ff8b6) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add lint-runner tool

- [`0c278fb`](https://github.com/BeOnAuto/auto-engineer/commit/0c278fb13ed39cd130b48bbfd0706c8810e57cb3) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add generate-test pipeline step

- [`66184b2`](https://github.com/BeOnAuto/auto-engineer/commit/66184b25e5f56c856a06dd1bb23bbe7d71df7dde) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add visual-test pipeline step

- [`3ac9683`](https://github.com/BeOnAuto/auto-engineer/commit/3ac968344263b8c8de7d993d08f11c54ace5806f) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-fix-loop pipeline step

- [`218c8f6`](https://github.com/BeOnAuto/auto-engineer/commit/218c8f6c18b69c981c629577298b1a088d19e736) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add test-runner tool

- [`2e7a605`](https://github.com/BeOnAuto/auto-engineer/commit/2e7a6058d8f07dff6882e96c3739b2a1a721885b) Thanks [@osamanar](https://github.com/osamanar)! - Now I have a clear picture of the changes. Here's the changelog:
  - Switched to sequential test-first generation so components are guided by their tests, producing more consistent and correct code
  - Added project context awareness so generated components use correct import paths, installed dependencies, and existing UI library components
  - Improved Storybook story generation with correct CSF3 format, proper import paths, and better defaults
  - Enhanced test generation with Tailwind CSS and semantic element guidance to avoid common JSDOM pitfalls

- [`f86a0a3`](https://github.com/BeOnAuto/auto-engineer/commit/f86a0a34a06049b11d80ad7028ad1f890c75a670) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: reset function
  - **root**: lock files
  - **component-implementor-react**: derive component path when files.create is empty
  - **component-implementor-react**: default targetDir to cwd when not provided
  - **pipeline**: remove deprecated react-component-implementer package

- [`4157be1`](https://github.com/BeOnAuto/auto-engineer/commit/4157be1274d746e6f1d64c5e0d88ec7207d59a7f) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add storybook-test pipeline step

- [`bcdc919`](https://github.com/BeOnAuto/auto-engineer/commit/bcdc91953e40f73e6e58efdad96a96067942d9cd) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add story-fix-loop pipeline step

- [`0e56745`](https://github.com/BeOnAuto/auto-engineer/commit/0e567455252e951c09fe9f2dce864ff7e0f366bb) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: wire implement-component to TDD pipeline
  - **component-implementor-react**: add pipeline runner
  - **component-implementor-react**: add visual-test pipeline step
  - **component-implementor-react**: add storybook-test pipeline step
  - **component-implementor-react**: add story-fix-loop pipeline step

- [`bbe1a2d`](https://github.com/BeOnAuto/auto-engineer/commit/bbe1a2d7dca3d85e4fd32434aa3eebfe4c3727cf) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add fixer agent prompts

- [`5c6e679`](https://github.com/BeOnAuto/auto-engineer/commit/5c6e6798747ef3a991985320fe57c7d9ac5d92d6) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add type-fix-loop pipeline step

- [`6a3b9b6`](https://github.com/BeOnAuto/auto-engineer/commit/6a3b9b68e43510af1279e86c7fd77406f9337c8d) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add type-checker tool

- [`2fcd6bf`](https://github.com/BeOnAuto/auto-engineer/commit/2fcd6bff85a71be29cc761d296655b47a86a7f1e) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add generate-story pipeline step

- [`e7826b4`](https://github.com/BeOnAuto/auto-engineer/commit/e7826b453694b5313e6e5adc2c708fa8d1cb189c) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add storybook-runner tool

- [`a2c443d`](https://github.com/BeOnAuto/auto-engineer/commit/a2c443d6fba92e4cb642771a361286bf83399070) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add lint-fix-loop pipeline step

- [`78aed6e`](https://github.com/BeOnAuto/auto-engineer/commit/78aed6ee75c5e704018f250a63069e9bba0ff722) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add generate-component pipeline step

- [`1183af5`](https://github.com/BeOnAuto/auto-engineer/commit/1183af5740aa74975b9b6e7ed665b3deeedac520) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: add pipeline runner

### Patch Changes

- [`72fcc02`](https://github.com/BeOnAuto/auto-engineer/commit/72fcc022df4630900dad4d7e76b0cb588f220c5f) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: format source files to pass biome check

- [`49da584`](https://github.com/BeOnAuto/auto-engineer/commit/49da5840118ec25922a47dbe3fc4e824ad6d08f5) Thanks [@osamanar](https://github.com/osamanar)! - - **pipeline**: use res.on('close') for SSE disconnect and http.get in test

- [`e777b1b`](https://github.com/BeOnAuto/auto-engineer/commit/e777b1b0ee53c2ac8881e498c9fce80b2637db23) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: remove old generators, update exports

- [`2c04b77`](https://github.com/BeOnAuto/auto-engineer/commit/2c04b7752b2f63c7f0b4a86877d61f56305e639f) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: remove all explicit any from improve script

- [`ece67b6`](https://github.com/BeOnAuto/auto-engineer/commit/ece67b629546a717cae3f1fd50f14d3c3ccdb549) Thanks [@osamanar](https://github.com/osamanar)! - - **examples/typical**: use workspace protocol instead of link for internal deps

- [`c0fe3a4`](https://github.com/BeOnAuto/auto-engineer/commit/c0fe3a4185b1438e2d741ee27ed43522099a4681) Thanks [@osamanar](https://github.com/osamanar)! - - **file-upload**: narrow Uint8Array to Uint8Array<ArrayBuffer> for BodyInit compatibility

- [`ad1fb3b`](https://github.com/BeOnAuto/auto-engineer/commit/ad1fb3b9601773a98b4f33cffc08899468e46560) Thanks [@osamanar](https://github.com/osamanar)! - - **component-implementor-react**: update ketchup plan

## 1.98.0

### Minor Changes

- [`b91b61a`](https://github.com/BeOnAuto/auto-engineer/commit/b91b61a1b486e20aac0f55bf4b7e462cc733d9c5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added pipeline reset function to allow clearing and reinitializing pipeline state

### Patch Changes

- [`a3eb50f`](https://github.com/BeOnAuto/auto-engineer/commit/a3eb50f1ce9394fa606eb86d1c1dcbb8d7ef3935) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: derive component path when files.create is empty

- [`a032125`](https://github.com/BeOnAuto/auto-engineer/commit/a0321258b35adeacc67ede0ace593dd8a9913939) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed lock files to ensure consistent dependency resolution

- [`070310d`](https://github.com/BeOnAuto/auto-engineer/commit/070310d44e41569aeea61501cbf18e44fa995d28) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: always update server package.json dependency versions
  - **global**: version packages

- [`3c8f4d4`](https://github.com/BeOnAuto/auto-engineer/commit/3c8f4d4dfeb4a883bf45fb1876e0836f195e9af8) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: register component-implementor-react as plugin

- [`18ae6ee`](https://github.com/BeOnAuto/auto-engineer/commit/18ae6eeb5ee347ede38eaa9acdbf1ff34358b778) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: guard buildSpecSection against undefined items

- [`12a0549`](https://github.com/BeOnAuto/auto-engineer/commit/12a0549079253778e043fdfd21b12bad2eb8469a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: default targetDir to cwd when not provided

## 1.97.2

### Patch Changes

- [`f4da3ee`](https://github.com/BeOnAuto/auto-engineer/commit/f4da3ee8aefefd9f4663a9190ec4dae501734373) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: update package specifiers to use link paths and upgrade emmett to 0.43.0-beta.5
  - **pipeline**: use unique IDs for NodeStatusChanged in message log projection
  - **create-auto-app**: fix new workspace structure
  - **global**: version packages
  - **global**: upgrade emmett to 0.43.0-beta.5 and remove unused deps

- [`f6f011e`](https://github.com/BeOnAuto/auto-engineer/commit/f6f011e1edfb4280e1b116e20c237474703420e5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: always update server package.json dependency versions

## 1.97.1

### Patch Changes

- [`6df53da`](https://github.com/BeOnAuto/auto-engineer/commit/6df53da7f001bf1c53cdec510b8fa97aee962141) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: extract only first version block from CHANGELOG for release notes

- [`59415bc`](https://github.com/BeOnAuto/auto-engineer/commit/59415bc4e76fbc7f9915e08ed963bbdf8eda0c60) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated internal package references to use link paths for improved dependency resolution
  - Upgraded emmett dependency to 0.43.0-beta.5

- [`a955ac9`](https://github.com/BeOnAuto/auto-engineer/commit/a955ac906e0580a5169f6b8ec7ae0b65c7b05254) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed workspace structure generation when creating new Auto apps

- [`eb29c3c`](https://github.com/BeOnAuto/auto-engineer/commit/eb29c3c1d3ae185a3c8aa0fb47db2682254b932b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: upgrade emmett to 0.43.0-beta.5 and remove unused deps

- [`9bfa56c`](https://github.com/BeOnAuto/auto-engineer/commit/9bfa56c8469e27ed64922b85b5a228934cb7f3de) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: use unique IDs for NodeStatusChanged in message log projection

## 1.97.0

### Minor Changes

- [`08c9b8f`](https://github.com/BeOnAuto/auto-engineer/commit/08c9b8fb11ebd82b7b08f96bd2911bc202c19c44) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: pass preWarmed flag from DEPS_PRE_WARMED env var and remove --ignore-workspace
  - **server-generator-apollo-emmett**: remove --ignore-workspace from install command
  - **dev-server**: add preWarmed flag to install server dependencies
  - **dev-server**: add preWarmed flag to install client dependencies
  - **packages/pipeline**: add GET /run-stats endpoint with pipeline status

### Patch Changes

- [`d9944e3`](https://github.com/BeOnAuto/auto-engineer/commit/d9944e391c42ff8a0abec38eed04b70dc056818e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: extract only first version block from CHANGELOG for release notes

## 1.96.0

### Minor Changes

- [`81f38b5`](https://github.com/BeOnAuto/auto-engineer/commit/81f38b57044f9556a9f90dca2cd5fc945c9cd34c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **packages/pipeline**: add getRunStats method to PipelineReadModel

- [`26e7f3e`](https://github.com/BeOnAuto/auto-engineer/commit/26e7f3e445149e3eef2e4872686aff841ff25a70) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: add scene field to NarrativeSchema

- [`4a24c5a`](https://github.com/BeOnAuto/auto-engineer/commit/4a24c5a1e62a943760e7d855434e5e2b9a9d9a22) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: add preWarmed flag to install client dependencies

- [`b227607`](https://github.com/BeOnAuto/auto-engineer/commit/b227607fb4cc5e23b4ee12073d48058d6d6031e1) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: remove --ignore-workspace from install command

- [`f42888d`](https://github.com/BeOnAuto/auto-engineer/commit/f42888de73e6167e92316b657da7834869e6cf39) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: add JourneyPlanningSchema progressive disclosure variant

- [`2709e66`](https://github.com/BeOnAuto/auto-engineer/commit/2709e6650ae277a7abacc4c4b4cbfd5fdc1cbc86) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: export Journey, SceneClassification, SceneRoute, JourneyPlanning types

- [`b1a635a`](https://github.com/BeOnAuto/auto-engineer/commit/b1a635aa5845d270086e354685d8277106e9d633) Thanks [@osamanar](https://github.com/osamanar)! - Based on the diff analysis, here's the changelog:
  - Upgraded AI prompt system with detailed, role-based prompts for component, test, story, and reconciler generation
  - Added a reconciliation step that harmonizes generated component code with its Storybook story
  - Introduced an automated improvement loop that evaluates output quality across multiple spec scenarios and iteratively refines prompts
  - Consolidated shared types and spec-building logic into reusable modules, reducing duplication across generators
  - Added sample component specs (action button, data card, search input, and more) for benchmarking prompt quality

- [`032349d`](https://github.com/BeOnAuto/auto-engineer/commit/032349d475dd3cea19fe440bf4f903bd473dec60) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: pass preWarmed flag from DEPS_PRE_WARMED env var and remove --ignore-workspace

- [`a177d2a`](https://github.com/BeOnAuto/auto-engineer/commit/a177d2a07e71e7c6f98146ce8f6287a4d2829c37) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: add SceneRouteSchema and SceneClassificationSchema

- [`42d7111`](https://github.com/BeOnAuto/auto-engineer/commit/42d711159577d6844e74955a10361d57b154ca44) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **packages/pipeline**: add getAllItemStatuses and getAllNodeStatuses to PipelineReadModel

- [`19d3375`](https://github.com/BeOnAuto/auto-engineer/commit/19d33751bc6912c1e2745e0f06b860f16bd2056e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: add null-document guidance to projection template
  - **server-generator-apollo-emmett**: add discriminated union guidance to evolve template
  - **server-generator-apollo-emmett**: fill missing inline object fields with type defaults
  - **server-implementer**: add discriminated union narrowing guidance to prompts
  - **server-implementer**: load full shared directory into implementer context

- [`981285d`](https://github.com/BeOnAuto/auto-engineer/commit/981285d9d5fa747a9d924d9388e111750453e0be) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: add preWarmed flag to install server dependencies

- [`267cb9f`](https://github.com/BeOnAuto/auto-engineer/commit/267cb9fd83c90bd4a7e3a9b38c2577b3d744ad61) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: add journeys to modelSchema and JourneyPlanningSchema

- [`056ef79`](https://github.com/BeOnAuto/auto-engineer/commit/056ef797bd70346b47f0f0ad2a48a2c567204d46) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **packages/pipeline**: add GET /run-stats endpoint with pipeline status

- [`a6cb7ec`](https://github.com/BeOnAuto/auto-engineer/commit/a6cb7ec9460bc4412e5ce022473815e668774f44) Thanks [@osamanar](https://github.com/osamanar)! - - Improved the starter template for generated React clients
  - Added a run script for easier project execution

- [`2e7404e`](https://github.com/BeOnAuto/auto-engineer/commit/2e7404e5ce5f222d0931e63d8adb2f8acbeec494) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: add JourneySchema

### Patch Changes

- [`6dfd6cc`](https://github.com/BeOnAuto/auto-engineer/commit/6dfd6ccac984f3f85cfdfd8de9c0771083e1be8d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: add server deps to root for workspace pre-warming

- [`991cb70`](https://github.com/BeOnAuto/auto-engineer/commit/991cb70914a145e20f174698418a16e81782221c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: convert typical example to pnpm workspace

- [`cf8c874`](https://github.com/BeOnAuto/auto-engineer/commit/cf8c874347eff977663c5f958c9fcba06a65921e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: add ketchup plan for journey-narrative consolidation RFC

- [`f02782d`](https://github.com/BeOnAuto/auto-engineer/commit/f02782d419431234046b0f0bd91ead278f9a1b07) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **packages/pipeline**: add correlationId query param and use runStats for hasActivity in /run-stats

- [`02bf378`](https://github.com/BeOnAuto/auto-engineer/commit/02bf378c5f26061efef1636abdffa472600b8103) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: sort exports to fix biome organizeImports error

- [`b1d6595`](https://github.com/BeOnAuto/auto-engineer/commit/b1d6595116b32332e38ee7b34a2b274ada8d173e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated esbuild build tool dependencies to latest versions

- [`c756f3f`](https://github.com/BeOnAuto/auto-engineer/commit/c756f3fed9c48547b2709128c76ab81262ce25c6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: update ketchup-plan and apply linter fixes

- [`06efd83`](https://github.com/BeOnAuto/auto-engineer/commit/06efd83cb0c813fc5e869ac9f3ff7811a3857940) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: increase server test timeouts for CI reliability

- [`a5cb16c`](https://github.com/BeOnAuto/auto-engineer/commit/a5cb16ccf7b3758e39b8bf2d96ce164b7e3d2bc6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: update lockfile for server deps

- [`784c650`](https://github.com/BeOnAuto/auto-engineer/commit/784c6504222da8bd8557cfde80252866fc2b69ef) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: export RunStats type from package index

## 1.95.0

### Minor Changes

- [`d641d0e`](https://github.com/BeOnAuto/auto-engineer/commit/d641d0e6ded1c6e136a2d33e380c204b730abeb1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: add null-document guidance to projection template
  - **server-generator-apollo-emmett**: add discriminated union guidance to evolve template
  - **server-generator-apollo-emmett**: fill missing inline object fields with type defaults
  - **server-implementer**: add discriminated union narrowing guidance to prompts
  - **server-implementer**: load full shared directory into implementer context

### Patch Changes

- [`d49324c`](https://github.com/BeOnAuto/auto-engineer/commit/d49324cec0f25f601f8beec216898da05cce22f9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **component-implementor-react**: add missing publishConfig for public npm access

## 1.94.0

### Minor Changes

- [`5c22022`](https://github.com/BeOnAuto/auto-engineer/commit/5c220229c406fe300930f21530bea288cfe709ee) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: add null-document guidance to projection template
  - **server-generator-apollo-emmett**: add discriminated union guidance to evolve template
  - **server-generator-apollo-emmett**: fill missing inline object fields with type defaults
  - **server-implementer**: add discriminated union narrowing guidance to prompts
  - **server-implementer**: load full shared directory into implementer context

### Patch Changes

- [`e016efa`](https://github.com/BeOnAuto/auto-engineer/commit/e016efa10d937a630e7be631f1c11722e8aed024) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: extract inline object helpers to narrative, migrate all consumers

## 1.93.0

### Minor Changes

- [`b39bfd1`](https://github.com/BeOnAuto/auto-engineer/commit/b39bfd1b15a6ba83bf70c1045f0f99ca01af9e6d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fill missing inline object fields with type defaults
  - **server-implementer**: add discriminated union narrowing guidance to prompts
  - **global**: mark all bursts done in ketchup plans

- [`0d1d200`](https://github.com/BeOnAuto/auto-engineer/commit/0d1d200744a6cbf8d1383ca3189ff3c3056d1baf) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add null-document guidance to projection template

- [`21a0840`](https://github.com/BeOnAuto/auto-engineer/commit/21a084062e0132a146c31b5ed395051f8423dbed) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: filter event And-steps from react Then items
  - **global**: update ketchup plans for Date bug + implementer context fixes
  - **server-generator-apollo-emmett**: mark burst 18 done in ketchup plan
  - **narrative**: mark all bursts done in ketchup plan

- [`c8b5ced`](https://github.com/BeOnAuto/auto-engineer/commit/c8b5ced06aec8f03fd81270da37b70ed0c5ee1a4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: load full shared directory into implementer context

- [`5779ee2`](https://github.com/BeOnAuto/auto-engineer/commit/5779ee2adec80576a3885e11268310cfaf487be3) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add .auto-configure.json to .gitignore
  - **generate-react-client**: send X-Org-Id header in components upload
  - **cli**: persist /configure data to .auto-configure.json
  - **cli**: /configure defaults COMPONENTS_UPLOAD_URL for local dev
  - **cli**: /configure sets ORG_ID and PROJECT_ID env vars

- [`ef365c4`](https://github.com/BeOnAuto/auto-engineer/commit/ef365c4f58a41736871db4c70b817375984a638e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add discriminated union narrowing guidance to prompts

- [`7abc038`](https://github.com/BeOnAuto/auto-engineer/commit/7abc038ca3ddd6b71e94523b26be23ed62acc06b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add discriminated union guidance to evolve template

- [`8c21b52`](https://github.com/BeOnAuto/auto-engineer/commit/8c21b529e4f0a83f00bdaa0fe10562b12a19d349) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fix formatTsValue for inline object types and Array<T>

### Patch Changes

- [`36446e8`](https://github.com/BeOnAuto/auto-engineer/commit/36446e80626f019fef6409d3c8b2b0c0eee74b32) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: mark bursts 20-22 done in ketchup plan

- [`a306579`](https://github.com/BeOnAuto/auto-engineer/commit/a3065799dd4f2c60cacf895d4af93af456d93447) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: mark all bursts done in ketchup plans

## 1.92.0

### Minor Changes

- [`b984faa`](https://github.com/BeOnAuto/auto-engineer/commit/b984faa03a182560b49182129bfd183768c27890) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: send X-Org-Id header in components upload

- [`b4b422c`](https://github.com/BeOnAuto/auto-engineer/commit/b4b422c00c0e2a59bf7d9bc35c5d9f29e86bea0d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: persist /configure data to .auto-configure.json

- [`5475f60`](https://github.com/BeOnAuto/auto-engineer/commit/5475f6079c6591e8b5fa8dd22825a9d933d0aeb8) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added .auto-configure.json to .gitignore to prevent local configuration from being committed to version control

- [`5c5b8bc`](https://github.com/BeOnAuto/auto-engineer/commit/5c5b8bc401fdc3234ae4fdca1fdf13770eeb0935) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **component-implementor-react**: add index.ts with COMMANDS export
  - **component-implementor-react**: add implement-component command handler
  - **component-implementor-react**: add generate-story module
  - **component-implementor-react**: add generate-component module
  - **component-implementor-react**: add generate-test module

- [`17713c7`](https://github.com/BeOnAuto/auto-engineer/commit/17713c757e3f340b68709152563a3e8ac69c32a2) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: remove uploadFile from starter build-component-db

- [`bc5e46b`](https://github.com/BeOnAuto/auto-engineer/commit/bc5e46b5c5b65f488e18a87fa252ab35b20ce79b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: /configure sets ORG_ID and PROJECT_ID env vars

- [`903f609`](https://github.com/BeOnAuto/auto-engineer/commit/903f6099b898803b6cbf42ce0c9aa59f2675da2c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: replace signer upload with direct POST to components endpoint

- [`bd8c82c`](https://github.com/BeOnAuto/auto-engineer/commit/bd8c82cb031101598d0a85d45d0c43c2deca579e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: /configure defaults COMPONENTS_UPLOAD_URL for local dev

## 1.91.0

### Minor Changes

- [`ca28476`](https://github.com/BeOnAuto/auto-engineer/commit/ca2847643354c281b82b3427bb45be1caf023370) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add generate-test module

- [`c272077`](https://github.com/BeOnAuto/auto-engineer/commit/c272077c9934a7ed44e2a8eeec800dd7de41eb2a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add extract-code-block utility

- [`2263623`](https://github.com/BeOnAuto/auto-engineer/commit/2263623af310170130aaa99dbd41919378c397ab) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add generate-component module

- [`ceaa70d`](https://github.com/BeOnAuto/auto-engineer/commit/ceaa70df7f8374f8426f3a876a516b2433f28da1) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add generate-story module

- [`a54bd95`](https://github.com/BeOnAuto/auto-engineer/commit/a54bd9562f9bed95bb1d78e627028d27761b1624) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add index.ts with COMMANDS export

- [`150fcb0`](https://github.com/BeOnAuto/auto-engineer/commit/150fcb020d147a5563c3b7a3712e7fcd25febd9e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add implement-component command handler

### Patch Changes

- [`39d380d`](https://github.com/BeOnAuto/auto-engineer/commit/39d380d87fcd9507a24e0848b1934246f7ab7ee0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add ketchup plan

- [`8d0ef1f`](https://github.com/BeOnAuto/auto-engineer/commit/8d0ef1f12d0bccb0825c7e70e64c92c5325aaad3) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: add package infrastructure

- [`aa6f3ec`](https://github.com/BeOnAuto/auto-engineer/commit/aa6f3ec7c976b1acebaafa22f29385e0757ab807) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated project dependency lockfile

- [`7a132d1`](https://github.com/BeOnAuto/auto-engineer/commit/7a132d126238ea715dcbd13ee2261ce2def70428) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **component-implementor-react**: mark all bursts done in plan

- [`f5ccb56`](https://github.com/BeOnAuto/auto-engineer/commit/f5ccb566483a3350298d92cd6ca3d3632f636bd3) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **create-auto-app**: standardize formatting and improve code readability

## 1.90.0

### Minor Changes

- [`090369e`](https://github.com/BeOnAuto/auto-engineer/commit/090369eb6c4a788a051851d93ad78e147f0ffa15) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: filter event And-steps from react Then items
  - **narrative**: export validateSliceRequests and add integration tests
  - **narrative**: add nested field validation for query slice requests
  - **narrative**: add query validation for operation type, state, and top-level fields
  - **narrative**: add mutation validation to validate-slice-requests

### Patch Changes

- [`3311f9b`](https://github.com/BeOnAuto/auto-engineer/commit/3311f9bdbc2e133f094a054f1526f653886302ab) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Standardized formatting and improved code readability in the create-auto-app package

## 1.89.0

### Minor Changes

- [`93ff5a5`](https://github.com/BeOnAuto/auto-engineer/commit/93ff5a559f087bb875b2b1e165713e1dc6fbea5b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: embed instructions in scaffold templates

- [`514525d`](https://github.com/BeOnAuto/auto-engineer/commit/514525d0ae9542693fc44e6922fd0c31d229c8c9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: export validateSliceRequests and add integration tests

- [`7af6ae4`](https://github.com/BeOnAuto/auto-engineer/commit/7af6ae46d50a7115da047d07824a4d3e4983338f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add nested field validation for query slice requests

- [`971394a`](https://github.com/BeOnAuto/auto-engineer/commit/971394ad8d47faad27acf6c4fa82d11010568cda) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: type-annotate aggregateStream + dynamic error listing

- [`dbfbe69`](https://github.com/BeOnAuto/auto-engineer/commit/dbfbe69e5fc1efb8a65df1d3d480b36c9666b95a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add validate-slice-requests skeleton with parse safety

- [`d7b3af9`](https://github.com/BeOnAuto/auto-engineer/commit/d7b3af912b1e9f7e4f0bfc91b65768341f87229c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add query validation for operation type, state, and top-level fields

- [`a36fc79`](https://github.com/BeOnAuto/auto-engineer/commit/a36fc79f40d236b49983574a7f8607e9028e3daf) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: filter linking field to primitive types only

- [`73ef7b1`](https://github.com/BeOnAuto/auto-engineer/commit/73ef7b1f2818e72cc5b1cc77400f44ed948e0d39) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: filter event And-steps from react Then items

- [`ea41643`](https://github.com/BeOnAuto/auto-engineer/commit/ea41643cbd1303f50313e7dd20d92d4f3a775114) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use parsedRequest for command mutation names

- [`3e9cf93`](https://github.com/BeOnAuto/auto-engineer/commit/3e9cf93af40df9636ae33b9e749dd85ca0b0802e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add expectEvents typing shim to decide.specs.ts.ejs

- [`0231c5f`](https://github.com/BeOnAuto/auto-engineer/commit/0231c5f5a771786d6534c8a0f9d6dd2856d6b893) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: parseGraphQlRequest accepts mutation operations

- [`aacffe9`](https://github.com/BeOnAuto/auto-engineer/commit/aacffe9244a1b364f550caf9b0d5d9ce9c905c2c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-nestjs**: use parsedRequest for mutation and query names

- [`a527ccc`](https://github.com/BeOnAuto/auto-engineer/commit/a527ccc39d7f769609252ebefcb4b26e5fe84316) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add mutation validation to validate-slice-requests

### Patch Changes

- [`dc9b7d9`](https://github.com/BeOnAuto/auto-engineer/commit/dc9b7d9cbcebaf5e34025b6f08b9152f87a67073) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan for bursts 13-14

- [`1d1f519`](https://github.com/BeOnAuto/auto-engineer/commit/1d1f519fa17ba95228e58ef12ce64e3919c0697d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: add ketchup plan for validate-slice-requests

- [`8bbbc30`](https://github.com/BeOnAuto/auto-engineer/commit/8bbbc309734ff5dce3b51473f018caa31208fa7a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: mark burst 18 done in ketchup plan

- [`aabe8ae`](https://github.com/BeOnAuto/auto-engineer/commit/aabe8ae4feb13e8ee4b6d3e8a7ef50bb845eaebf) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: derive stable metadata.now for ISO date fields
  - **server-generator-apollo-emmett**: resolve findOne idField from events when missing in Then state
  - **server-generator-apollo-emmett**: return array idField natively from extraction
  - **server-implementer**: add prompt guardrails for phantom enums and hardcoded projections
  - **server-generator-apollo-emmett**: align instruction comment with \_state parameter name

- [`5af523f`](https://github.com/BeOnAuto/auto-engineer/commit/5af523f9cb5d1a4e6275589e1f12173637c6458e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fix [object Object] serialization bugs

- [`a4053ef`](https://github.com/BeOnAuto/auto-engineer/commit/a4053ef91284b9718bacef58ebd3ab250d4cda79) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update decide.specs.ts snapshots for dynamic errors

- [`b63c308`](https://github.com/BeOnAuto/auto-engineer/commit/b63c308209f0316ea3b0433a82d46dec8e15169a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add anti-hardcoding rules for decide functions

- [`1947b66`](https://github.com/BeOnAuto/auto-engineer/commit/1947b66d0b4687abcde75f29fc32c8665b929582) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: move burst 17 to done in ketchup plan

- [`16c9541`](https://github.com/BeOnAuto/auto-engineer/commit/16c954130331be27f54f2e1ef451545b7e22161d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: extract parseGraphQlRequest to narrative package

- [`bad8ef9`](https://github.com/BeOnAuto/auto-engineer/commit/bad8ef9ceb73f9b7efda58f821073ec9894ee7fb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: rename ParsedGraphQlQuery to ParsedGraphQlOperation

- [`a058731`](https://github.com/BeOnAuto/auto-engineer/commit/a0587319d6772df61b4004df1584d884222e7304) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: add ketchup plan for parsedRequest mutation names

- [`d6f6ef6`](https://github.com/BeOnAuto/auto-engineer/commit/d6f6ef6f79ceb712ccfcf00a22789c55d6e9a0b4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: omit non-command fields from Then assertions
  - **server-generator-apollo-emmett**: derive stable metadata.now for ISO date fields
  - **server-generator-apollo-emmett**: resolve findOne idField from events when missing in Then state
  - **server-generator-apollo-emmett**: return array idField natively from extraction
  - **server-implementer**: add prompt guardrails for phantom enums and hardcoded projections

- [`667b53f`](https://github.com/BeOnAuto/auto-engineer/commit/667b53f02b3cc933efe520022dd2f85ba1fbec3b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: move burst 14 to done in ketchup plan

- [`e69b385`](https://github.com/BeOnAuto/auto-engineer/commit/e69b38526ab9fd522ef91955a3ee98ed3c611473) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **narrative**: mark all bursts done in ketchup plan

## 1.88.0

### Minor Changes

- [`0bd0133`](https://github.com/BeOnAuto/auto-engineer/commit/0bd0133f31bbcf82b4496619c06ec52b8b7c0443) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: emit ComponentDBFileUploaded event on artifact upload
  - **global**: version packages

### Patch Changes

- [`18d9065`](https://github.com/BeOnAuto/auto-engineer/commit/18d9065870dbd41ddac298c6b5a288dc9f9d5898) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: align instruction comment with \_state parameter name

- [`48aed87`](https://github.com/BeOnAuto/auto-engineer/commit/48aed87a84982422ae52fd42626433fd0195cd61) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add prompt guardrails for phantom enums and hardcoded projections

- [`b7bfd7b`](https://github.com/BeOnAuto/auto-engineer/commit/b7bfd7bf198713e5b4639a8f9dd8e720378b1c76) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: derive stable metadata.now for ISO date fields

- [`af9294c`](https://github.com/BeOnAuto/auto-engineer/commit/af9294c4b2c44546124bffba1df76eb7da59e1a1) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: return array idField natively from extraction

- [`ac6ff49`](https://github.com/BeOnAuto/auto-engineer/commit/ac6ff49ff17333fb1c7cab099084fb5b314b7658) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: update ketchup plan with Bursts 6-7

- [`b47c94a`](https://github.com/BeOnAuto/auto-engineer/commit/b47c94a1936734f5defafdcae9fa7060d0fefbb0) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: resolve findOne idField from events when missing in Then state

## 1.87.0

### Minor Changes

- [`abc0dfc`](https://github.com/BeOnAuto/auto-engineer/commit/abc0dfcb0c18b244add124eb35e8547e68569d85) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: add signer mode to uploadToArtifactPath
  - **global**: version packages

- [`90ecc94`](https://github.com/BeOnAuto/auto-engineer/commit/90ecc941ec0a2f148e0d2672e7b2db02ba9803a1) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: emit ComponentDBFileUploaded event on artifact upload

## 1.86.0

### Minor Changes

- [`d052585`](https://github.com/BeOnAuto/auto-engineer/commit/d052585817dac3e1d6cbe8e7ee78cc25aba4585e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: add signer mode to uploadToArtifactPath

- [`4225014`](https://github.com/BeOnAuto/auto-engineer/commit/42250148e63ff945662f71a94f4f4a8eabad33cc) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: build-component-db uploads to artifact path via env vars
  - **global**: version packages

## 1.85.0

### Minor Changes

- [`eef47a0`](https://github.com/BeOnAuto/auto-engineer/commit/eef47a0424e6528ea832a907dacc8bc398b34dfe) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: merge co-firing GWT conditions in gwt.ts
  - **server-generator-apollo-emmett**: fix singleton projection instruction steps 1 and 4
  - **global**: version packages
  - **server-generator-apollo-emmett**: add snapshot test for co-firing rule merge
  - **server-implementer**: add Bursts 4-5 to ketchup plan

- [`f90636d`](https://github.com/BeOnAuto/auto-engineer/commit/f90636d198db18032ce9b9e8f165d158ad9d0176) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: build-component-db uploads to artifact path via env vars

## 1.84.0

### Minor Changes

- [`7b5e912`](https://github.com/BeOnAuto/auto-engineer/commit/7b5e912dfda709fd3d33bf478f515d4e86c982af) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-implementer**: integrate shadow detection into retry loops
  - **server-implementer**: add detectImportedTypeShadowing utility
  - **server-generator-nestjs**: add model to ServerGenerationFailedEvent
  - **server-generator-apollo-emmett**: add model to failure events
  - **pipeline**: emit PipelineRunCompleted when all commands complete

- [`ba4b32f`](https://github.com/BeOnAuto/auto-engineer/commit/ba4b32f29fbfb45e14a6294fdc06583e466fb7e3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: merge co-firing GWT conditions in gwt.ts

### Patch Changes

- [`3271cfe`](https://github.com/BeOnAuto/auto-engineer/commit/3271cfe4b8be6316454045b02e1e0f1d1fd6414f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: fix singleton projection instruction steps 1 and 4

- [`4833113`](https://github.com/BeOnAuto/auto-engineer/commit/4833113ca52361ca4a4c931390a48b592f1adc78) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add snapshot test for co-firing rule merge

- [`c3c788d`](https://github.com/BeOnAuto/auto-engineer/commit/c3c788defe899dd9c3d50819759c15df764fab2e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add Bursts 4-5 to ketchup plan

## 1.83.0

### Minor Changes

- [`d4fca9a`](https://github.com/BeOnAuto/auto-engineer/commit/d4fca9a9898dfe2087a8489e5e9dbbd9a6253d24) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: emit PipelineRunCompleted when all commands complete

- [`dfda4a1`](https://github.com/BeOnAuto/auto-engineer/commit/dfda4a16a93f50100e7492990e6906bbc8b2445c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add detectImportedTypeShadowing utility

- [`a58a249`](https://github.com/BeOnAuto/auto-engineer/commit/a58a249899b6b97f6166d13a11e175478b9bcb8c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-nestjs**: add model to ServerGenerationFailedEvent

- [`98ba39b`](https://github.com/BeOnAuto/auto-engineer/commit/98ba39b83131ef24093e6100432d9cf6b1dcdd76) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add debounce logic to QuiescenceTracker

- [`a305e78`](https://github.com/BeOnAuto/auto-engineer/commit/a305e788b5344d5533be3b95e7702bcbb03056f7) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: integrate shadow detection into retry loops

- [`c8f3f9f`](https://github.com/BeOnAuto/auto-engineer/commit/c8f3f9ff4d173b063d039d3ee7bd6b639044dd5c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add model to failure events

- [`2b920cc`](https://github.com/BeOnAuto/auto-engineer/commit/2b920cc6c90951d3fa6c1039cf883dd17e8d59c7) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - add restart commands for server, client, and storybook
  - update killPortHolder to use graceful SIGTERM then SIGKILL
  - sort imports in restart command files
  - sort exports alphabetically to satisfy biome organizeImports
  - **typical**: update clean:dev script to include installation step

### Patch Changes

- [`e5f9f43`](https://github.com/BeOnAuto/auto-engineer/commit/e5f9f439a2c622d1241438e6b9431556c9e55691) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: verify PipelineRunCompleted waits for retries

- [`e2da8b5`](https://github.com/BeOnAuto/auto-engineer/commit/e2da8b5ccee2bc606dd8d7e13968e2c3081e4314) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-implementer**: add ketchup plan for type shadow detection

- [`3967f21`](https://github.com/BeOnAuto/auto-engineer/commit/3967f21a7bbc12aded3137b1d5982cd588a2ed51) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: clarify Internal State Pattern extends not replaces

- [`5b14f47`](https://github.com/BeOnAuto/auto-engineer/commit/5b14f472b15edee7255570eb0fc796ebbfa638e5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: update ketchup-plan with completed model repair bursts

- [`d435781`](https://github.com/BeOnAuto/auto-engineer/commit/d4357815201bade7a48f665c3d8fa696c5755b4f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **typical**: wire SubmitBugReport on generation failures

- [`afa04da`](https://github.com/BeOnAuto/auto-engineer/commit/afa04da090785aedf34567183db0e7a46f54c9ee) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: add ketchup plan for model repair system

- [`46189ec`](https://github.com/BeOnAuto/auto-engineer/commit/46189ec17840f8d42fb95003f82dead4875ddd03) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: update ketchup-plan with completed Phase 13

- [`f4bc85c`](https://github.com/BeOnAuto/auto-engineer/commit/f4bc85c4026522dfcfd15844bdc50e645185a912) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: remove invalid argument to reactor.close()

- [`3dbb41e`](https://github.com/BeOnAuto/auto-engineer/commit/3dbb41edf2d1eb3a7110038aeb29952befc570da) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed a bug where a required argument was missing when closing the reactor in the Apollo Emmett server generator

## 1.82.0

### Minor Changes

- [`944665a`](https://github.com/BeOnAuto/auto-engineer/commit/944665afd71e9193681427f17dc324910424e8e0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added restart commands for server, client, and storybook
  - Fixed clean:dev script to include the installation step

- [`5fe80c3`](https://github.com/BeOnAuto/auto-engineer/commit/5fe80c343c16ebe6fe967c3c33c47c77c26398dc) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - update killPortHolder to use graceful SIGTERM then SIGKILL

- [`cfd0ff2`](https://github.com/BeOnAuto/auto-engineer/commit/cfd0ff2c30666168d709452ea59855781f49e480) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - add restart commands for server, client, and storybook

### Patch Changes

- [`e54f2f8`](https://github.com/BeOnAuto/auto-engineer/commit/e54f2f8fab5e97af390431ef739d940859fcebbd) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: add HMR configuration to Vite server settings
  - **global**: version packages

- [`7df54c5`](https://github.com/BeOnAuto/auto-engineer/commit/7df54c5c6e66ad07f500f4992fb3633016f69ef7) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - sort imports in restart command files

- [`9905df3`](https://github.com/BeOnAuto/auto-engineer/commit/9905df3c3a2617788e731d6245413774a90a979a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - update ketchup-plan for restart commands

- [`c8b668b`](https://github.com/BeOnAuto/auto-engineer/commit/c8b668b00d4228bd1feeb4962500e830a27c32e6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - sort exports alphabetically to satisfy biome organizeImports

## 1.81.0

### Minor Changes

- [`9e5108b`](https://github.com/BeOnAuto/auto-engineer/commit/9e5108b25fc9b9ede6a4b51e450ac9c85e3e40c4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-checks**: extract runLintCheck core logic
  - **server-checks**: extract runTypeCheck core logic
  - **server-checks**: extract findProjectRoot into shared module
  - format files with biome
  - **app-implementer**: replace Message[] with ChatTurn in RefinementHistory

### Patch Changes

- [`f225ede`](https://github.com/BeOnAuto/auto-engineer/commit/f225edec208bb5bce29869c676e7cca35f5b0958) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added Hot Module Replacement (HMR) configuration to the generated React client's Vite server settings

## 1.80.0

### Minor Changes

- [`43082f0`](https://github.com/BeOnAuto/auto-engineer/commit/43082f08820c36d3f380b0e47b98263bc0287cf2) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-checks**: extract runLintCheck core logic
  - **server-checks**: extract runTypeCheck core logic
  - **server-checks**: extract findProjectRoot into shared module
  - **app-implementer**: replace Message[] with ChatTurn in RefinementHistory
  - **react-component-implementer**: replace Message[] with ChatTurn in RefinementHistory

### Patch Changes

- [`4bdde8b`](https://github.com/BeOnAuto/auto-engineer/commit/4bdde8b4803a8e85234786e4d2e0cc227ad10859) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Temporarily disabled existing tests in app and component generator specs for upcoming refactor

- [`3e7f02d`](https://github.com/BeOnAuto/auto-engineer/commit/3e7f02d79e078374c02c76ee7d261c76c35ce3be) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - format files with biome

## 1.79.0

### Minor Changes

- [`ec198e5`](https://github.com/BeOnAuto/auto-engineer/commit/ec198e559e662df16611ba433c56938304a869b6) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: extract findProjectRoot into shared module

- [`f460341`](https://github.com/BeOnAuto/auto-engineer/commit/f46034125e102b216d35a59f7260170480dc7fa4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: extract runTypeCheck core logic

- [`ec1480d`](https://github.com/BeOnAuto/auto-engineer/commit/ec1480d6431df13948ae26dc2ad691c28ddafdf8) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-component-implementer**: add aesthetic quality checks to visual evaluator
  - **app-implementer**: add comprehensive recipe-based visual design system
  - **react-component-implementer**: replace design principles with Tailwind recipes
  - **global**: version packages
  - **react-component-implementer**: finalize ketchup plan for design system upgrade

- [`8eb0244`](https://github.com/BeOnAuto/auto-engineer/commit/8eb02443763228e8182cfb3c30606e94cc9f0c30) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: extract runLintCheck core logic

### Patch Changes

- [`506b0b4`](https://github.com/BeOnAuto/auto-engineer/commit/506b0b4810247e10c0896d45a37f4f0610d53455) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **react-component-implementer**: replace Message[] with ChatTurn in RefinementHistory

- [`087f977`](https://github.com/BeOnAuto/auto-engineer/commit/087f9776128b0610b945f23d0f4c3bc1a3d816dd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **app-implementer**: replace Message[] with ChatTurn in RefinementHistory

- [`9bc98b4`](https://github.com/BeOnAuto/auto-engineer/commit/9bc98b4f384fa3417447e65286b015e1e10e63e9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: slim CheckLint handler to delegate to runLintCheck

- [`b3ed5c1`](https://github.com/BeOnAuto/auto-engineer/commit/b3ed5c10575d00ca106237137bafc3524e8e9d82) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: ketchup plan for slim ReadModel API

- [`9c7ad8f`](https://github.com/BeOnAuto/auto-engineer/commit/9c7ad8fb3dd5d8321a80c4035baa9fe20701b651) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: ketchup plan for LLM context growth optimization

- [`cedc3c0`](https://github.com/BeOnAuto/auto-engineer/commit/cedc3c0995af6025ab3d38a5a65d5bec9b4ecc7d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **model-factory**: add ChatMessage and ChatTurn types for refinement history

- [`9757597`](https://github.com/BeOnAuto/auto-engineer/commit/9757597a1e562dfe81efa2de128aa10e8d091c79) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: add ketchup plan for unify check commands

- [`8104cc8`](https://github.com/BeOnAuto/auto-engineer/commit/8104cc82e7193c6a1a52a60da844a3e3fdb20b3b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: export findProjectRoot, runTypeCheck, runLintCheck from index

- [`0bdb8d9`](https://github.com/BeOnAuto/auto-engineer/commit/0bdb8d9e606ce702cb7bbe81cbdc1f55fff58881) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: finalize ketchup plan for unify check commands

- [`31f65ac`](https://github.com/BeOnAuto/auto-engineer/commit/31f65acb9dfb656edfd482afc454bb4373b1d29d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: slim ReadModel API to find + findOne

- [`25f8375`](https://github.com/BeOnAuto/auto-engineer/commit/25f8375ac181f09ff50aca3bccc3132b97814637) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **react-component-implementer**: replace lint-tier with runLintCheck, delete type-checker

- [`ab92096`](https://github.com/BeOnAuto/auto-engineer/commit/ab920961c9fd7515be9c09b4dbb1054bf03c94b9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **react-component-implementer**: replace type-check-tier with runTypeCheck

- [`bcd8c4a`](https://github.com/BeOnAuto/auto-engineer/commit/bcd8c4a1e5e3d867c248d6bd55f66d7ef4863f46) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: use shared findProjectRoot in check-tests

- [`41ed452`](https://github.com/BeOnAuto/auto-engineer/commit/41ed4525bc796b1bdc1825fed20dd9f336108ca8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-checks**: slim CheckTypes handler to delegate to runTypeCheck

## 1.78.0

### Minor Changes

- [`4b29a2e`](https://github.com/BeOnAuto/auto-engineer/commit/4b29a2e95bec496ea403593a200664b10645c0cb) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: add aesthetic quality checks to visual evaluator

- [`56de1d6`](https://github.com/BeOnAuto/auto-engineer/commit/56de1d6bd0b63c988847cbaa1027f0e934f2f5d7) Thanks [@osamanar](https://github.com/osamanar)! - - **app-implementer**: add comprehensive recipe-based visual design system

- [`73ffce3`](https://github.com/BeOnAuto/auto-engineer/commit/73ffce321cbc5e0a6c91506ccfe6c7ee7635a1ee) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/react-component-implementer**: fixes component generation
  - **react-component-implementer**: add comprehensive visual design system to prompt
  - **global**: version packages

- [`e9a92e0`](https://github.com/BeOnAuto/auto-engineer/commit/e9a92e0244299674e0071bc8afa5b0f38eb10e85) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: replace design principles with Tailwind recipes

### Patch Changes

- [`3045eb6`](https://github.com/BeOnAuto/auto-engineer/commit/3045eb6a8e26213660562eaa480b5b50478bde0c) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: finalize ketchup plan for design system upgrade

- [`953ade0`](https://github.com/BeOnAuto/auto-engineer/commit/953ade01f373b9259f853310a3dd43a0f06d56bf) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: add ketchup plan for visual design system upgrade

## 1.77.0

### Minor Changes

- [`86f1663`](https://github.com/BeOnAuto/auto-engineer/commit/86f166399983a32804d3cc43ea51638b044c0ecc) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed component generation in the React component implementer

- [`2040186`](https://github.com/BeOnAuto/auto-engineer/commit/2040186f95edbc78748e79d79b9e606e058bce08) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: add comprehensive visual design system to prompt

### Patch Changes

- [`b668102`](https://github.com/BeOnAuto/auto-engineer/commit/b668102043e71071c4fb5f776fdcd68b357606ee) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: kill stale port holders before spawning services
  - **dev-server**: make port-cleanup a pure utility with no lifecycle side effects
  - **server-generator-apollo-emmett**: remove try/catch that swallows command errors
  - **global**: version packages
  - **dev-server**: finalize ketchup plan for port-cleanup fix

## 1.76.0

### Minor Changes

- [`28eb621`](https://github.com/BeOnAuto/auto-engineer/commit/28eb6214532f2e63e4d8c87b8e2ff7b2ac6d97e6) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: add lastDurationMs tracking to node status
  - **pipeline**: add startedAt/endedAt timing to item status projection
  - **pipeline**: include timestamp in /messages endpoint response
  - **server-generator-apollo-emmett**: pass an empty object to reactor.close call
  - **server-generator-apollo-emmett**: remove extra argument in reactor.close call

- [`d0844fb`](https://github.com/BeOnAuto/auto-engineer/commit/d0844fb796931e5aa1064ed4c6205e53afa8d3b4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: wire registerPort into start-server, start-client, start-storybook
  - **server-generator-apollo-emmett**: remove try/catch that swallows command errors
  - **dev-server**: killActivePortHolders is a no-op when port is free

### Patch Changes

- [`5c950af`](https://github.com/BeOnAuto/auto-engineer/commit/5c950af09d795a0d983bde748a45bf8fa56cf1b5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: update ketchup plan for port-cleanup fix

- [`87bb859`](https://github.com/BeOnAuto/auto-engineer/commit/87bb859bc3d29410363231d8b685d7bfe8a0c6bf) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: make port-cleanup a pure utility with no lifecycle side effects

- [`443df2d`](https://github.com/BeOnAuto/auto-engineer/commit/443df2dbad31ed42e3f15fe31c1758c4138735f3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: kill stale port holders before spawning services

- [`8cafdcd`](https://github.com/BeOnAuto/auto-engineer/commit/8cafdcd489f65e4212cc23d952ce59824742845d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: finalize ketchup plan for port-cleanup fix

## 1.75.0

### Minor Changes

- [`1658c1c`](https://github.com/BeOnAuto/auto-engineer/commit/1658c1c2c3933a02dd503771ec29437140d18cc1) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: include timestamp in /messages endpoint response

- [`37a6fb8`](https://github.com/BeOnAuto/auto-engineer/commit/37a6fb86e448227a9bea8bc0ba608c9fdf0e07ee) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add lastDurationMs tracking to node status

- [`a15186f`](https://github.com/BeOnAuto/auto-engineer/commit/a15186fcb8c53cf4bb60076a55100f845d01a017) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add startedAt/endedAt timing to item status projection

- [`3dcd1db`](https://github.com/BeOnAuto/auto-engineer/commit/3dcd1db09ea707ff1f4a56c2ca050a586923190e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: wire registerPort into start-server, start-client, start-storybook
  - **dev-server**: killActivePortHolders kills child process holding a port
  - **server-generator-apollo-emmett**: remove unused projectionType from template locals
  - **server-generator-apollo-emmett**: use original-case projection name for collection name
  - **global**: version packages

### Patch Changes

- [`e94151f`](https://github.com/BeOnAuto/auto-engineer/commit/e94151f28fac06bbb4e681b667c2043b6a90eb6f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: remove extra argument in reactor.close call

- [`644a7ae`](https://github.com/BeOnAuto/auto-engineer/commit/644a7ae40d733612cef5cde067217f53038013fb) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed an error in the Apollo Emmett server generator where the reactor close call was missing a required argument

## 1.74.0

### Minor Changes

- [`1704646`](https://github.com/BeOnAuto/auto-engineer/commit/17046467a5bdc77954dcb366b3bd36a26e4813ee) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: killActivePortHolders kills child process holding a port

- [`b590030`](https://github.com/BeOnAuto/auto-engineer/commit/b59003030eddfc5b1447f6bd12155533a9dd77f1) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: wire registerPort into start-server, start-client, start-storybook

### Patch Changes

- [`2fe5699`](https://github.com/BeOnAuto/auto-engineer/commit/2fe56999d8a2344bfa146ce3544d694cc1b169f2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use original-case projection name for collection name

- [`1dc5f8f`](https://github.com/BeOnAuto/auto-engineer/commit/1dc5f8f0f75832fe2e83f6f4322f1a88c3b66840) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: killActivePortHolders is a no-op when port is free

- [`d4992ab`](https://github.com/BeOnAuto/auto-engineer/commit/d4992ab5957ccaa7969f1a80a77d72da62cc5d8f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: rewire handler to use activeServer with staleness guards
  - **server-generator-apollo-emmett**: add ketchup plan for collection name casing fix

- [`b6e6b45`](https://github.com/BeOnAuto/auto-engineer/commit/b6e6b45bc9e3c70116c847a56d04257b3005d186) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: add ketchup plan and vitest config for port cleanup

- [`46a506a`](https://github.com/BeOnAuto/auto-engineer/commit/46a506aa8c975030d50fd8f7a24915d5616a640d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: remove unused projectionType from template locals

- [`3f28eff`](https://github.com/BeOnAuto/auto-engineer/commit/3f28eff2d16ec557742fc1b50c647f05c08d863c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: rewire handler to use activeServer with staleness guards
  - **dev-server**: add module-level ActiveServer state and cleanup infrastructure
  - **global**: version packages
  - **dev-server**: add ketchup plan for EADDRINUSE fix

## 1.73.0

### Minor Changes

- [`71bc8a3`](https://github.com/BeOnAuto/auto-engineer/commit/71bc8a33aee1fef366f16c6eca5f75c39594a1b4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: wire command gate into processCommand with signal suppression
  - **pipeline**: add signal to PipelineContext and registerConcurrency to server
  - **pipeline**: add queue strategy to command gate
  - **pipeline**: add cancel-in-progress strategy to command gate
  - **pipeline**: create command gate with registration and passthrough

### Patch Changes

- [`966c943`](https://github.com/BeOnAuto/auto-engineer/commit/966c94366fe94eb5f2f8de51bb51ffdd4c95f2d5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: add module-level ActiveServer state and cleanup infrastructure

- [`54b0ed2`](https://github.com/BeOnAuto/auto-engineer/commit/54b0ed2c119a1172e91775af992bc37b133035e0) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **dev-server**: rewire handler to use activeServer with staleness guards

- [`b8a4efb`](https://github.com/BeOnAuto/auto-engineer/commit/b8a4efb987badf2b7badcb8d66f8aeb50caf09f2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: call start/close lifecycle on reactor in ReactorSpecification
  - **server-generator-apollo-emmett**: call start/close lifecycle on reactor in ReactorSpecification
  - **dev-server**: add ketchup plan for EADDRINUSE fix
  - **pipeline**: mark command gate concurrency control done in ketchup plan
  - **global**: wire config-level concurrency for command gate

## 1.72.0

### Minor Changes

- [`cb7de6a`](https://github.com/BeOnAuto/auto-engineer/commit/cb7de6a5a8c42bf1849a7b4f602d8334d5399895) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: wire command gate into processCommand with signal suppression

- [`cddce02`](https://github.com/BeOnAuto/auto-engineer/commit/cddce020109adcbb7aa422ab89bc14805ef9f39a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate real commandSender.send() in react scaffold
  - **server-generator-apollo-emmett**: generate aggregateStream for Given states
  - **pipeline**: add command gate concurrency control to ketchup plan
  - **server-generator-apollo-emmett**: mark Burst 3 done in ketchup plan
  - **server-generator-apollo-emmett**: add Burst 3 to ketchup plan for commandSender.send generation

- [`ebc98fa`](https://github.com/BeOnAuto/auto-engineer/commit/ebc98fa1e38404bcb4dbaad28b9281ed25c9b27b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: add cancel-in-progress strategy to command gate

- [`27f3e77`](https://github.com/BeOnAuto/auto-engineer/commit/27f3e777b871a4cc5679331e445fe991cd2bfc8f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: add signal to PipelineContext and registerConcurrency to server

- [`c00b253`](https://github.com/BeOnAuto/auto-engineer/commit/c00b25354839afb1b506c27d19795da3fdc24280) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: create command gate with registration and passthrough

- [`59b9032`](https://github.com/BeOnAuto/auto-engineer/commit/59b903255b34a3beb6579d91f656530b05fef807) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: add queue strategy to command gate

- [`80f544e`](https://github.com/BeOnAuto/auto-engineer/commit/80f544ebc7617ffe83d880cfb34c11f31ca8a340) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: generate real commandSender.send() in react scaffold
  - **server-generator-apollo-emmett**: generate aggregateStream for Given states
  - **server-generator-apollo-emmett**: seed event store with Given state data in react specs template
  - **global**: version packages
  - **server-generator-apollo-emmett**: mark Burst 3 done in ketchup plan

### Patch Changes

- [`c5ce884`](https://github.com/BeOnAuto/auto-engineer/commit/c5ce884e233a8d9eec5c76db41b166bb86b09e70) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **global**: wire config-level concurrency for command gate

- [`090b856`](https://github.com/BeOnAuto/auto-engineer/commit/090b8569ce5eb62b680b48fbc909cbbad12ff377) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: mark command gate concurrency control done in ketchup plan

- [`5e8b6a8`](https://github.com/BeOnAuto/auto-engineer/commit/5e8b6a8ec6502c6e9b955eab93d4d332c5a8def9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: verify cancel-in-progress suppresses events through server

- [`e4b956c`](https://github.com/BeOnAuto/auto-engineer/commit/e4b956cd2751ea78e9b8a4725f9be755abf2bb24) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **pipeline**: verify queue concurrency and sendCommand gate integration

- [`1b7cb23`](https://github.com/BeOnAuto/auto-engineer/commit/1b7cb230b570c763e24c6a0eb99b39901e671500) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: call start/close lifecycle on reactor in ReactorSpecification

## 1.71.0

### Minor Changes

- [`82543ae`](https://github.com/BeOnAuto/auto-engineer/commit/82543aec90a4398696e148f9ea26e5f4df51eb91) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: seed event store with Given state data in react specs template

- [`6a7a3f2`](https://github.com/BeOnAuto/auto-engineer/commit/6a7a3f237c1267e1835168afaccf21e482e48278) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate aggregateStream for Given states
  - **server-generator-apollo-emmett**: add Burst 3 to ketchup plan for commandSender.send generation
  - **server-generator-apollo-emmett**: mark all react Given states bursts done

- [`560d192`](https://github.com/BeOnAuto/auto-engineer/commit/560d19212be145f358ab2176c2424f6a8849070f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate real commandSender.send() in react scaffold

- [`b5f823a`](https://github.com/BeOnAuto/auto-engineer/commit/b5f823a8b6e08c05518220aedad5b686e8bf37ac) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate aggregateStream for Given states

### Patch Changes

- [`dde21b9`](https://github.com/BeOnAuto/auto-engineer/commit/dde21b9f06c8aaba5d18cfa4f1a68eed3bf4c190) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: mark all react Given states bursts done

- [`28efa44`](https://github.com/BeOnAuto/auto-engineer/commit/28efa44f51373af11febb3fff00d85d1b3350784) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: mark Burst 3 done in ketchup plan

- [`8b1238a`](https://github.com/BeOnAuto/auto-engineer/commit/8b1238ab2c98ad7bf396987edabf642b43b730bd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add ketchup plan for react slice Given states fix

- [`e7a4ddf`](https://github.com/BeOnAuto/auto-engineer/commit/e7a4ddff607260651ecbf504a881a21db4657f19) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **job-graph-processor**: increase time tolerance for parallel job dispatch test
  - **root**: update @event-driven-io/emmett and @event-driven-io/emmett-sqlite versions to 0.42.0
  - **ci**: remove --reporter=append to show pnpm install errors
  - **generate-react-client**: update landing page header text
  - **pipeline**: emit to event store before SSE broadcast in broadcastPipelineRunStarted

## 1.70.0

### Minor Changes

- [`d5b9b83`](https://github.com/BeOnAuto/auto-engineer/commit/d5b9b83ae2a40f0f34a9e5823fd7f582ffb578a5) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: update landing page header text color and height
  - **pipeline**: remove v1 SettledTracker, PhasedExecutor, and related projections
  - **pipeline**: wire V2 bridges into PipelineServer
  - **pipeline**: add phased bridge with V2 workflow processor integration
  - **pipeline**: add V2RuntimeBridge for settled descriptor path

### Patch Changes

- [`5c8110b`](https://github.com/BeOnAuto/auto-engineer/commit/5c8110b45fcb7597e348ffc00386f69e1e4fcc13) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: emit to event store before SSE broadcast in broadcastPipelineRunStarted

- [`3f7324f`](https://github.com/BeOnAuto/auto-engineer/commit/3f7324fa09b306b6ce67d6c337501e2f521f2d60) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated the landing page header text in the React client

- [`a7a0616`](https://github.com/BeOnAuto/auto-engineer/commit/a7a06161e3bd923116c827a816b4df809e1807f5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated Emmett and SQLite driver dependencies in the Apollo server generator

- [`4c39d83`](https://github.com/BeOnAuto/auto-engineer/commit/4c39d8395445b7fe9c36c4943214cd216471366a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: plan for fix emit-before-broadcast race

- [`a83d744`](https://github.com/BeOnAuto/auto-engineer/commit/a83d74432c94c79fc7fee0beaa0e9bccc5721dd0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add settled correlationId fix bursts to plan

- [`30579ce`](https://github.com/BeOnAuto/auto-engineer/commit/30579ce1382f0fe1856b478f25828c90eeecc698) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **ci**: remove --reporter=append to show pnpm install errors

- [`d4c314e`](https://github.com/BeOnAuto/auto-engineer/commit/d4c314eb75e3de81d90b198422cb3538946cd08b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated Emmett and Emmett SQLite dependencies to version 0.42.0

- [`6e9516a`](https://github.com/BeOnAuto/auto-engineer/commit/6e9516a004d29eac3bdc8585f7b3cc70f2b624ef) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Improved stability of parallel job dispatch timing in the job graph processor

- [`46bf3e7`](https://github.com/BeOnAuto/auto-engineer/commit/46bf3e7a2ffbce7f5a840689091ddaa061457ccc) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: use sessionCorrelationId for settled bridge keying

## 1.69.0

### Minor Changes

- [`1a2b945`](https://github.com/BeOnAuto/auto-engineer/commit/1a2b9450b359c83e5b2db1ec388eedb5d7186937) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: remove v1 SettledTracker, PhasedExecutor, and related projections

- [`ff965bb`](https://github.com/BeOnAuto/auto-engineer/commit/ff965bb66fe354a71646ae5cf1117ce6ec028e59) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: wire V2 bridges into PipelineServer

- [`44884eb`](https://github.com/BeOnAuto/auto-engineer/commit/44884ebb193c4a67ef2ee3e4db277cf59321f82a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add V2RuntimeBridge for settled descriptor path

- [`89a89bb`](https://github.com/BeOnAuto/auto-engineer/commit/89a89bbce79c56dca51558bb53a2fdf6f2449906) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add processKeyed/getState/resetInstance to WorkflowProcessor

- [`e85c168`](https://github.com/BeOnAuto/auto-engineer/commit/e85c168b05612c4b2b14b4d2b014832e375ce28d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: add phased bridge with V2 workflow processor integration

- [`6c6d235`](https://github.com/BeOnAuto/auto-engineer/commit/6c6d235b7f30edbf92bbd52a0a843b7f21d041a0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated landing page header styling with new text color and height

### Patch Changes

- [`b1ef570`](https://github.com/BeOnAuto/auto-engineer/commit/b1ef57088eab79473b2527bc574e4c35c7d2630b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: bumps turbo

- [`1712efa`](https://github.com/BeOnAuto/auto-engineer/commit/1712efa6ad43c17755aa2cb22256c7fb420e9451) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: move V2 engine swap to DONE in ketchup plan

- [`6004cde`](https://github.com/BeOnAuto/auto-engineer/commit/6004cdec16f7fbaa1ef92bb7effe0e626c7b288c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: update ketchup plan with V2 engine swap bursts

## 1.68.0

### Minor Changes

- [`465e8cb`](https://github.com/BeOnAuto/auto-engineer/commit/465e8cb4ef9ebc43a3ecb3ce979f2cd19631310d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: emit PipelineRestarted event on RestartPipeline command
  - **pipeline**: add SQLite persistence with dual-write and replay on startup
  - **pipeline**: session-based status tracking
  - **pipeline**: parallelize emit mapping commands with Promise.all
  - **pipeline**: pipeline server v2 with POST /command, GET /health, /registry, /events SSE

### Patch Changes

- [`b8c20b7`](https://github.com/BeOnAuto/auto-engineer/commit/b8c20b7c68bbea8aba9974b5d70193fb608bf014) Thanks [@osamanar](https://github.com/osamanar)! - - Bumped Turbo build tool to a newer version

## 1.67.0

### Minor Changes

- [`2132223`](https://github.com/BeOnAuto/auto-engineer/commit/2132223077bdc181cc7a5e5197fba921275056d6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: emit PipelineRestarted event on RestartPipeline command
  - **pipeline**: add SQLite persistence with dual-write and replay on startup
  - **pipeline**: session-based status tracking
  - **pipeline**: parallelize emit mapping commands with Promise.all
  - **pipeline**: pipeline server v2 with POST /command, GET /health, /registry, /events SSE

## 1.66.0

### Minor Changes

- 675ef99: - **pipeline**: settled decide returns SettledFailed when no retries left
- 3a2b8db: - **pipeline**: define-v2 toGraph() converts registrations to GraphIR
- 2934f85: - **pipeline**: createPipelineStore wraps SQLite event store
- b824630: - **pipeline**: session-based status tracking
- 3c013d7: - **pipeline**: settled decide returns RetryCommands on failure with retries left
- b0436c1: - **pipeline**: define-v2 on().emit() and on().handle() registrations
- 6cbae5c: - **pipeline**: settled decide returns [] when not all commands complete
- 34a0fd1: - **pipeline**: emit PipelineRestarted event on RestartPipeline command
- aa5cb13: - **pipeline**: settled workflow evolve tracks command starts and completions
- 5916594: - **pipeline**: parallelize emit mapping commands with Promise.all
- e44989c: - **pipeline**: sqlite consumer polls events in order from store
- bede5a3: - **pipeline**: engine projections wrap existing evolve functions for SQLite
- af1e4b6: - **packages/react-component-implementer**: fixes component generation
  - **packages/generate-react-client**: fixes types
  - **packages/generate-react-client**: improves starter
  - **global**: version packages
- 00d3142: - **pipeline**: phased decide advances to next phase when current completes
- 0e9abee: - **pipeline**: pipeline server v2 with POST /command, GET /health, /registry, /events SSE
- 27c3b2a: - **pipeline**: pipeline engine wires dispatcher, router, and workflow processor
- 8002c21: - **pipeline**: event router dispatches commands for emit mappings
- 47ae70c: - **pipeline**: add SQLite persistence with dual-write and replay on startup
- 9e1658a: - **pipeline**: command dispatcher finds handler by command type
- 95399f7: - **pipeline**: settled decide returns AllSettled when all pass
- 1997734: - **pipeline**: dispatchAndStore appends command result events to store
- ea43b36: - **pipeline**: phased decide dispatches phase 0 commands on start
- 25dadc8: - **pipeline**: define-v2 .on().forEach().groupInto().process() produces PhasedRegistration
- 9d4d240: - **pipeline**: await workflow evolve tracks key completions
- f7c5dba: - **pipeline**: define-v2 .settled() produces SettledRegistration
- d6c7b68: - **pipeline**: await decide returns AwaitCompleted when all resolved
- bdc4728: - **pipeline**: createSettledWorkflow factory from DSL params

### Patch Changes

- 613a84b: - Fixed incorrect indentation for .env and client entries in the typical example configuration
- b7739f4: - **pipeline**: integration tests for engine pipeline flow
- ba42186: - **pipeline**: mark all durable pipeline bursts done
- ab5f5cb: - **job-graph-processor**: verify ready jobs dispatch in parallel
- 68734cd: - **pipeline**: add replay bug reproduction e2e test
- 0d1bbff: - **pipeline**: add E2E test suite bursts to ketchup plan
- c418bbf: - **pipeline**: mark all E2E bursts complete in ketchup plan
- 7fecdac: - **pipeline**: add multi-archetype combined pipeline e2e test
- 75f7b31: - **pipeline**: add concurrency and non-blocking e2e tests
- 09bb123: - **pipeline**: add settled all-pass e2e test
- ef92bf1: - **pipeline**: add durable SQLite persistence bursts to plan
- cf0e26e: - **pipeline**: add graph visualization e2e test
- c5d3c0d: - **pipeline**: add await workflow e2e test
- 1c79ada: - **pipeline**: update ketchup plan — 44/48 bursts complete
- a3353c9: - **pipeline**: add parallel scatter-gather bursts P-1 to P-3
- e89fda3: - **pipeline**: mark session tracking bursts done in ketchup plan
- 19f89b4: - **pipeline**: add phased sequential execution e2e test
- a6a2567: - **pipeline**: add settled retry and failure e2e tests
- e1f9019: - **pipeline**: mark SQLite persistence bursts done in plan
- 5ca50f2: - **pipeline**: add ketchup plan for Emmett engine migration
- f5a1a84: - **pipeline**: add phased stopOnFailure e2e test
- 9da7fb4: - **pipeline**: add session-based status tracking bursts to ketchup plan
- f09beb4: - **job-graph-processor**: add parallel dispatch verification burst P-4
- fd92e76: - **pipeline**: settled scatter-gather runs checks in parallel
- 2a23265: - **pipeline**: add e2e test harness and emit chain tests
- 8561e33: - **pipeline**: add v2 pipeline exports to package barrel

## 1.65.0

### Minor Changes

- [`bd14e09`](https://github.com/BeOnAuto/auto-engineer/commit/bd14e09fa399e218348a4d0f334bc3423106f64a) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed component generation in the React component implementer

- [`f3a6b66`](https://github.com/BeOnAuto/auto-engineer/commit/f3a6b662a35ae480d58a42d5207cb51d1e9106de) Thanks [@osamanar](https://github.com/osamanar)! - - Improved the starter template for React client generation

- [`e4ed42d`](https://github.com/BeOnAuto/auto-engineer/commit/e4ed42dac98562148efc5ae293841c36efa6c5c7) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed type definitions in the React client generator

### Patch Changes

- [`d5c985a`](https://github.com/BeOnAuto/auto-engineer/commit/d5c985a1a4bcd256f6456ecb69d9523ae66c2352) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: remove stale QuestionnaireProgressStatus enum
  - **server-generator-apollo-emmett**: regenerate shared/types.ts from scratch to prevent stale enums
  - **global**: version packages
  - **server-generator-apollo-emmett**: move burst 1 to DONE in ketchup plan
  - **server-generator-apollo-emmett**: add ketchup plan for stale enums fix

## 1.64.0

### Minor Changes

- [`e34d090`](https://github.com/BeOnAuto/auto-engineer/commit/e34d090e4b0395ec87ff241dfc483530869108e9) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: updates auto config
  - **packages/react-component-implementer**: fixes storybook not found
  - **global**: version packages

### Patch Changes

- [`d03809f`](https://github.com/BeOnAuto/auto-engineer/commit/d03809fc59b903ad18a3c6536661bd5e14205e54) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add ketchup plan for stale enums fix

- [`37077d3`](https://github.com/BeOnAuto/auto-engineer/commit/37077d33d6bc319afc6b4a583d2dc4bdcd1e3998) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Removed .env file from the typical example project to prevent environment secrets from being tracked in version control

- [`ab31e10`](https://github.com/BeOnAuto/auto-engineer/commit/ab31e10bdc9389b7e123d7425e3a3105894710b2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: move burst 1 to DONE in ketchup plan

- [`0b27996`](https://github.com/BeOnAuto/auto-engineer/commit/0b27996df56fad5b38e78828de875c2091e5fd6d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Removed stale QuestionnaireProgressStatus enum that was no longer in use, preventing potential type conflicts in the Apollo Emmett server generator

- [`4bc755b`](https://github.com/BeOnAuto/auto-engineer/commit/4bc755b4187b30906c7272aa7c49af00dfae6c4a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: regenerate shared/types.ts from scratch to prevent stale enums

## 1.63.0

### Minor Changes

- [`2718453`](https://github.com/BeOnAuto/auto-engineer/commit/2718453da86dca4e2f67367f5e291c3df91e3ebf) Thanks [@osamanar](https://github.com/osamanar)! - - Updated auto configuration in the typical example

- [`6ad93c2`](https://github.com/BeOnAuto/auto-engineer/commit/6ad93c2a234636067c979fe6b832684ffecd1620) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed an issue where Storybook could not be found during React component implementation

### Patch Changes

- [`204a5e6`](https://github.com/BeOnAuto/auto-engineer/commit/204a5e62d18cc94057997f3090c0790e7f7dd7a1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: prevent duplicate PipelineRunStarted events
  - **global**: version packages

## 1.62.0

### Minor Changes

- [`462c004`](https://github.com/BeOnAuto/auto-engineer/commit/462c00482143056b05f8d8a80b6018173b20a615) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: enhance dark mode support and loading state styles
  - **global**: version packages

### Patch Changes

- [`b003d6f`](https://github.com/BeOnAuto/auto-engineer/commit/b003d6fe1dfca04dd7b148d23023fc7e3fb55f2b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **pipeline**: prevent duplicate PipelineRunStarted events

## 1.61.0

### Minor Changes

- [`2c05dca`](https://github.com/BeOnAuto/auto-engineer/commit/2c05dcaf11cc74e594b822d2fb56d0b1187b272e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Enhanced dark mode support for generated React client components
  - Improved loading state styles for better visual feedback during data fetching

- [`3b5b67e`](https://github.com/BeOnAuto/auto-engineer/commit/3b5b67e6ec0bacaef1b83daff19a334bd452ad0d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: enhance dark mode support and loading state styles
  - **global**: version packages

## 1.60.0

### Minor Changes

- [`e37c8aa`](https://github.com/BeOnAuto/auto-engineer/commit/e37c8aa2860adbdf51716bcbad52a21b4d13c4bf) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Enhanced dark mode support for generated React client components
  - Improved loading state styles for better visual feedback during data fetching

- [`93d25e4`](https://github.com/BeOnAuto/auto-engineer/commit/93d25e4fbe55e41405d9bb600f2b9e7f53db0cb0) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/react-component-implementer**: fix issues with app implementation
  - **global**: version packages

## 1.59.0

### Minor Changes

- [`dc97333`](https://github.com/BeOnAuto/auto-engineer/commit/dc973338ed6a5c7dcd204123a2935ed44ccf61e4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: sanitize malformed map types in field definitions
  - **server-generator-apollo-emmett**: add sanitizeFieldType helper
  - **server-generator-apollo-emmett**: emit SliceGenerationFailed for skipped fields
  - **server-generator-apollo-emmett**: sanitize messages and track SkippedFieldInfo
  - **server-generator-apollo-emmett**: add isValidTsIdentifier and filter inline fields

- [`c031dbe`](https://github.com/BeOnAuto/auto-engineer/commit/c031dbeb471ddeb9713f5c872352e5a405dab244) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed issues with app implementation in the React component implementer

## 1.58.0

### Minor Changes

- [`5c0ce7e`](https://github.com/BeOnAuto/auto-engineer/commit/5c0ce7e26f36b7809095cb16a7940ff9fc05314e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add isValidTsIdentifier and filter inline fields

- [`a90a25a`](https://github.com/BeOnAuto/auto-engineer/commit/a90a25a23c52783fd46dbde73cb9efa692e3b56a) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add sanitizeFieldType helper

- [`007bbbe`](https://github.com/BeOnAuto/auto-engineer/commit/007bbbe1fb3db946529e361500c32ba47053b3ee) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: emit SliceGenerationFailed for skipped fields

- [`301560d`](https://github.com/BeOnAuto/auto-engineer/commit/301560db8ce3dd13284439f86c12f9d51e29038e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: update .env and package.json for bug report testing
  - **submit-bug-report**: add pipeline command handler for bug reports
  - **cli**: set process.env.SERVICE_TOKEN from configure endpoint
  - **global**: version packages
  - **typical**: add worker-to-server env vars to .env files

- [`1776bea`](https://github.com/BeOnAuto/auto-engineer/commit/1776beacf27511f883e3218a8436741451acfa4e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: sanitize messages and track SkippedFieldInfo

- [`ba39eef`](https://github.com/BeOnAuto/auto-engineer/commit/ba39eefefa76d2e6f75a4f98d3677a314deabafc) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: sanitize malformed map types in field definitions

### Patch Changes

- [`5caa270`](https://github.com/BeOnAuto/auto-engineer/commit/5caa2705f4d6e1d958be91faa8de6dad2f449206) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add ketchup plan for malformed map type fix

- [`af365c0`](https://github.com/BeOnAuto/auto-engineer/commit/af365c050e347faf574d5561b5ee92b93cbc0899) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add ketchup plan for invalid TS identifier fix

- [`1c58459`](https://github.com/BeOnAuto/auto-engineer/commit/1c5845991c59cfeebc0a5596b054bfd3f56a36fc) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan — all bursts done

- [`da36c91`](https://github.com/BeOnAuto/auto-engineer/commit/da36c9111af0b15963f87b0ac75f81849f8b6c9f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: rename SkippedFieldInfo to FieldIssue

## 1.57.0

### Minor Changes

- [`49076be`](https://github.com/BeOnAuto/auto-engineer/commit/49076be22d7e587f4a2efcb2b621936d7e251a23) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated environment configuration and package settings to support bug report testing

- [`453db5e`](https://github.com/BeOnAuto/auto-engineer/commit/453db5eacc453ce9911ee3a2bf2816254efef0ee) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **submit-bug-report**: add pipeline command handler for bug reports

- [`bedd814`](https://github.com/BeOnAuto/auto-engineer/commit/bedd81404fe3ce41e7a8e1f63f7b806b1948bb84) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: add SliceGenerationFailed event for duplicate command handlers
  - **server-generator-apollo-emmett**: detect and skip duplicate command handlers
  - **global**: version packages

### Patch Changes

- [`e8e7e42`](https://github.com/BeOnAuto/auto-engineer/commit/e8e7e42d27a6c99f7a17202bf2f361a4605344db) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: set process.env.SERVICE_TOKEN from configure endpoint

- [`a0e682b`](https://github.com/BeOnAuto/auto-engineer/commit/a0e682b2e0ee66ce9fe62c5055383fd034cd6bdc) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: add worker-to-server env vars to .env files

## 1.56.0

### Minor Changes

- [`9ee6fb9`](https://github.com/BeOnAuto/auto-engineer/commit/9ee6fb9baf6009ac9d1011982f7923070f6d50cd) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: detect and skip duplicate command handlers

- [`5f75d51`](https://github.com/BeOnAuto/auto-engineer/commit/5f75d51d657fc443143d05e416a4554a930fba06) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: add iframe theme synchronization plugin
  - **global**: version packages

- [`cdddb26`](https://github.com/BeOnAuto/auto-engineer/commit/cdddb26dc92da4fa14cbcb625aa68249b70b7292) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator-apollo-emmett**: add SliceGenerationFailed event for duplicate command handlers

## 1.55.0

### Minor Changes

- [`a795f0d`](https://github.com/BeOnAuto/auto-engineer/commit/a795f0dc123179ff088e3837ccdccc98fb28253e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added iframe theme synchronization plugin for generated React clients, enabling automatic theme coordination between parent and embedded applications

### Patch Changes

- [`6ca68f9`](https://github.com/BeOnAuto/auto-engineer/commit/6ca68f92615897ea995c6cf4f9ad315c597ce68c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: adjust HMR stability threshold and poll interval
  - **global**: version packages

## 1.54.3

### Patch Changes

- [`44825c5`](https://github.com/BeOnAuto/auto-engineer/commit/44825c52296b837f664889935d5ddaaf49e58d6f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Adjusted HMR stability threshold and poll interval for improved hot module replacement reliability in the React client generator

- [`a52ef0d`](https://github.com/BeOnAuto/auto-engineer/commit/a52ef0d8682e0b521d8414b8627afe191c780a7b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: restore build step
  - **global**: version packages

## 1.54.2

### Patch Changes

- [`e6c6499`](https://github.com/BeOnAuto/auto-engineer/commit/e6c649998f75eacb55fe50528356a3f6ee6b5914) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: remove build dependency from release task
  - **global**: version packages

- [`798d7ae`](https://github.com/BeOnAuto/auto-engineer/commit/798d7ae1183716f01d0f0a1b34dc0b4972151034) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Restored the build step to fix the release pipeline

## 1.54.1

### Patch Changes

- [`10862a8`](https://github.com/BeOnAuto/auto-engineer/commit/10862a8f70b99020ac67a8bfe28b0b040993b562) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Removed unnecessary build step from the release process to streamline package publishing

- [`fce5d88`](https://github.com/BeOnAuto/auto-engineer/commit/fce5d88eae010ed5175b0e479d4a0caacd9d8602) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add empty inputs array to release task
  - **global**: version packages

## 1.54.0

### Minor Changes

- [`1c8ff48`](https://github.com/BeOnAuto/auto-engineer/commit/1c8ff48ac7190e6ae630fe31175f95f33413067f) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: fix npmrc and remove prepublishOnly scripts
  - **root**: update npmrc path for auth token
  - **global**: version packages
  - **global**: version packages

### Patch Changes

- [`e801415`](https://github.com/BeOnAuto/auto-engineer/commit/e80141555e044848cb6ebb7d6a0608d15bc642f9) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed release task configuration by adding required empty inputs array

## 1.53.0

### Minor Changes

- [`26b3f6c`](https://github.com/BeOnAuto/auto-engineer/commit/26b3f6cd80eda2b5378d196a695b4db9b0dab21a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: fix npmrc and remove prepublishOnly scripts
  - **global**: version packages

### Patch Changes

- [`2a0aa7c`](https://github.com/BeOnAuto/auto-engineer/commit/2a0aa7c847624c383493704a2db1fc3f6baf0550) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed authentication token path configuration for package publishing

## 1.52.0

### Minor Changes

- [`446f3f1`](https://github.com/BeOnAuto/auto-engineer/commit/446f3f1a03e1bc432ea3944d03a1e2bb43b6d009) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add auth token configuration to .npmrc
  - **root**: add passThroughEnv for environment variables
  - **root**: add release script to all packages and update turbo configuration
  - **root**: add --no-git-checks option to publish command
  - **root**: add workspace concurrency option to publish command

- [`c40f3ae`](https://github.com/BeOnAuto/auto-engineer/commit/c40f3ae6336115bdf2a5e4fcec9707cd9e32b5a7) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed npm registry configuration for package publishing
  - Removed prepublishOnly scripts across packages

## 1.51.0

### Minor Changes

- [`899968b`](https://github.com/BeOnAuto/auto-engineer/commit/899968bfd8ceea2e9075d94fd574399c1457fd59) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added authentication token configuration for npm registry access

- [`f42a264`](https://github.com/BeOnAuto/auto-engineer/commit/f42a2646cc454d7cafbb9b19a917b0ff08ba81ad) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add passThroughEnv for environment variables
  - **root**: add release script to all packages and update turbo configuration
  - **root**: add --no-git-checks option to publish command
  - **root**: add workspace concurrency option to publish command
  - **global**: version packages

## 1.50.0

### Minor Changes

- [`56634f5`](https://github.com/BeOnAuto/auto-engineer/commit/56634f599f68cdd490a2399f1ec0b99be1806888) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added environment variable passthrough configuration for build pipeline

- [`925724f`](https://github.com/BeOnAuto/auto-engineer/commit/925724fee777b7b559260d202abbe4f873c17501) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add release script to all packages and update turbo configuration
  - **root**: add --no-git-checks option to publish command
  - **root**: add workspace concurrency option to publish command
  - **global**: version packages
  - **global**: version packages

## 1.49.0

### Minor Changes

- [`1c040de`](https://github.com/BeOnAuto/auto-engineer/commit/1c040dee0ddcd66572d32f5cddcef27c79f9ba9e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added release script to all packages for streamlined publishing
  - Updated turbo configuration to support the new release workflow

### Patch Changes

- [`f7bdda2`](https://github.com/BeOnAuto/auto-engineer/commit/f7bdda263f9736fe049044bb1e106552c48380fb) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add --no-git-checks option to publish command
  - **root**: add workspace concurrency option to publish command
  - **global**: version packages
  - **global**: version packages

## 1.48.1

### Patch Changes

- [`d76dfc5`](https://github.com/BeOnAuto/auto-engineer/commit/d76dfc5777eb7f68a05f8a1377e58367d88ddf4e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added `--no-git-checks` option to the publish command to skip git validation during publishing

- [`e971532`](https://github.com/BeOnAuto/auto-engineer/commit/e97153233f25503a8a0c792c711b75baf032830d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: add workspace concurrency option to publish command
  - **global**: version packages

## 1.48.0

### Minor Changes

- [`4415c1f`](https://github.com/BeOnAuto/auto-engineer/commit/4415c1fa6c2f2354f9cbd1e4ba0cc74758e5f4b5) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: add port option and wait for HTTP readiness in start commands
  - **global**: version packages

### Patch Changes

- [`80e3074`](https://github.com/BeOnAuto/auto-engineer/commit/80e3074bef226c672c7913a50f4a0fcd081bb6ce) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added workspace concurrency option to the publish command for faster parallel publishing

## 1.47.0

### Minor Changes

- [`47ceac6`](https://github.com/BeOnAuto/auto-engineer/commit/47ceac6de603d6ee6e7d45e9affc4cb75eab943e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: generate InputType classes for referenced types in mutations
  - **server-generator-apollo-emmett**: generate ObjectType classes for referenced types in queries
  - **server-generator-apollo-emmett**: wire referencedTypes into template pipeline
  - **server-generator-apollo-emmett**: add resolveReferencedMessageTypes helper
  - **global**: version packages

- [`bb7b02b`](https://github.com/BeOnAuto/auto-engineer/commit/bb7b02bdc7059f0817dde5bb795377d9797e7c7a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added configurable port option for dev server start commands
  - Dev server now waits for HTTP readiness before reporting as started, improving reliability

## 1.46.0

### Minor Changes

- [`e6a0608`](https://github.com/BeOnAuto/auto-engineer/commit/e6a0608647143c3c2ace36f27e01756bc5e27955) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate ObjectType classes for referenced types in queries

- [`a50d7d7`](https://github.com/BeOnAuto/auto-engineer/commit/a50d7d7308e8d3e5319575f619d297cafa958f90) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add resolveReferencedMessageTypes helper

- [`75e3ed8`](https://github.com/BeOnAuto/auto-engineer/commit/75e3ed80f0d18ee53ef1fa952f93e387be65c355) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: generate InputType classes for referenced types in mutations

- [`93edcc4`](https://github.com/BeOnAuto/auto-engineer/commit/93edcc4a1df8b41f9d48a39b0f09965a9807b775) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: wire referencedTypes into template pipeline

### Patch Changes

- [`d9bd588`](https://github.com/BeOnAuto/auto-engineer/commit/d9bd588cc61fbac155f1e66a5de147ff80483f6e) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: ketchup plan for referenced message type GraphQL fix

- [`8eea55e`](https://github.com/BeOnAuto/auto-engineer/commit/8eea55ee073513f2149629bacd15e83e66f60b90) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: skip react slices with empty examples
  - **global**: version packages
  - **server-generator-apollo-emmett**: ketchup plan for empty-examples react slice fix

- [`02ef497`](https://github.com/BeOnAuto/auto-engineer/commit/02ef4977873e7b92ce7d8af03f0f65c5e5a06228) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan — all bursts done

## 1.45.3

### Patch Changes

- [`5031bde`](https://github.com/BeOnAuto/auto-engineer/commit/5031bde8b5958dfc61f3e04f4c45ba0cb81718c8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: skip react slices with empty examples

- [`3e94b15`](https://github.com/BeOnAuto/auto-engineer/commit/3e94b15d8a96be5afe9d4a189042d2ed6f3bb0e7) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: ketchup plan for empty-examples react slice fix
  - **server-generator-apollo-emmett**: update ketchup plan — all bursts done

- [`d614984`](https://github.com/BeOnAuto/auto-engineer/commit/d6149848a571b78cd0e41449a5ac787067492a4c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: use GraphQLJSON for object/inline-object types
  - **server-generator-apollo-emmett**: use isEnumType in query resolver template
  - **server-generator-apollo-emmett**: use isEnumType in projection template
  - **global**: version packages
  - **server-generator-apollo-emmett**: update ketchup plan — all bursts done

## 1.45.2

### Patch Changes

- [`ec189ef`](https://github.com/BeOnAuto/auto-engineer/commit/ec189ef549e7d3e6a7a7248d7de5f327fe36dcfd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use GraphQLJSON for object/inline-object types

- [`9b6afe6`](https://github.com/BeOnAuto/auto-engineer/commit/9b6afe6b6aa24b2948b90ad78d646db66b8f2a94) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use isEnumType in projection template

- [`ed2c247`](https://github.com/BeOnAuto/auto-engineer/commit/ed2c2474f103761b66879f5bbb99c4cd1008015f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: ketchup plan for enum detection false-positive fix

- [`ef6d8e9`](https://github.com/BeOnAuto/auto-engineer/commit/ef6d8e9f4c8b97d7c587529725278396a2496408) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: set server host to 0.0.0.0 for accessibility
  - **global**: version packages

- [`40c6c52`](https://github.com/BeOnAuto/auto-engineer/commit/40c6c52c85f06ea2669796ef30bce1a2e99c63f5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan — all bursts done

- [`7a9df68`](https://github.com/BeOnAuto/auto-engineer/commit/7a9df685e2d2d54de0b2a8149453b0d988c951aa) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: use isEnumType in query resolver template

- [`c44b3fd`](https://github.com/BeOnAuto/auto-engineer/commit/c44b3fdd2cafa8a3784e0c7d50b930251f888887) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: ketchup plan for GraphQLJSON fix

## 1.45.1

### Patch Changes

- [`1a0f666`](https://github.com/BeOnAuto/auto-engineer/commit/1a0f66600a0da9d24f5e8f0810ac32fd3e80d288) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: reduce delay times for checkStorybookRunning function in multiple scripts
  - **global**: version packages

- [`cb8a155`](https://github.com/BeOnAuto/auto-engineer/commit/cb8a15504432a21da73a08cb4123f00901b250a6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed React client development server not being accessible from external hosts by binding to all network interfaces

## 1.45.0

### Minor Changes

- [`520d649`](https://github.com/BeOnAuto/auto-engineer/commit/520d6491ebb13bef107b054342fdc48e29ee9e70) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: strip ANSI codes from error messages in failure events
  - **global**: version packages

### Patch Changes

- [`158b260`](https://github.com/BeOnAuto/auto-engineer/commit/158b26070113c1ae2754113349ddd8de09402ada) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Reduced delay times for Storybook readiness checks across multiple scripts for faster startup detection

## 1.44.0

### Minor Changes

- [`b1ad0e4`](https://github.com/BeOnAuto/auto-engineer/commit/b1ad0e431af6122b5fe394457dda9b452aa9e407) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Strip ANSI escape codes from error messages in server generation failure events for cleaner, more readable output

- [`fd648c7`](https://github.com/BeOnAuto/auto-engineer/commit/fd648c7ddab982896c795106a1b24773f5f32d97) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: add file-upload dependency to typical example and update pnpm lockfile
  - **global**: version packages

## 1.43.0

### Minor Changes

- [`0d03a8b`](https://github.com/BeOnAuto/auto-engineer/commit/0d03a8b079935b7b9c3293c45c0acbb5133ca593) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: call uploadFile after building components-db.json
  - **file-upload**: add direct http PUT mode and no-op when unconfigured
  - **file-upload**: uploadFile signer mode POSTs for presigned URL then PUTs
  - **file-upload**: uploadFile writes to local path via file:// URL
  - **global**: version packages

- [`f7dece7`](https://github.com/BeOnAuto/auto-engineer/commit/f7dece73ff5f4e2d5288a961e158d7f7a5c22bb2) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added automatic file upload of components-db.json after generation
  - Integrated file-upload package into the React client generator

## 1.42.0

### Minor Changes

- [`04880b4`](https://github.com/BeOnAuto/auto-engineer/commit/04880b40289edb0fb86ad60d9080392b418267bd) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **file-upload**: add direct http PUT mode and no-op when unconfigured

- [`65818ec`](https://github.com/BeOnAuto/auto-engineer/commit/65818ec3ec4b66cb07376d3b6222453cc35813da) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **file-upload**: uploadFile writes to local path via file:// URL

- [`8f6b02b`](https://github.com/BeOnAuto/auto-engineer/commit/8f6b02b75c71f2b8aca7460254fc8d7eab3cd673) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator**: preserve health resolver after cleanServerDir
  - **server-generator**: wire InitializeServer into COMMANDS and pipeline
  - **server-generator**: add InitializeServer command that creates bare runnable server
  - **lint**: biome lint fixes
  - **server-generator**: use explicit ESM import paths in generated server.ts

- [`c75bdac`](https://github.com/BeOnAuto/auto-engineer/commit/c75bdacab0548b5a1c46b6285f3602140fd2e7b0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: call uploadFile after building components-db.json

- [`28385df`](https://github.com/BeOnAuto/auto-engineer/commit/28385df9c38e8fb0f0cd0afc2b6a94f14896f549) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **file-upload**: uploadFile signer mode POSTs for presigned URL then PUTs

### Patch Changes

- [`bf57097`](https://github.com/BeOnAuto/auto-engineer/commit/bf57097f6560f946c7baf0deb637453164c6e100) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **file-upload**: scaffold package with package.json and tsconfig

## 1.41.0

### Minor Changes

- [`849fa10`](https://github.com/BeOnAuto/auto-engineer/commit/849fa106edffe48f2ac58f2fdb6ca66062fcebe7) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: wire InitializeServer into COMMANDS and pipeline

- [`8d37de6`](https://github.com/BeOnAuto/auto-engineer/commit/8d37de62e624d74be42f327d17386d79be005e57) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: preserve health resolver after cleanServerDir

- [`68df8c9`](https://github.com/BeOnAuto/auto-engineer/commit/68df8c92ea0f15f9cd225e9a313be54ae9eaa301) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: add HMR stability settings to prevent rebuild loops
  - **pipeline**: don't die when processes die
  - **global**: version packages
  - enforce Biome as sole formatter in VSCode
  - **typical**: add convenience dev script

- [`cc8fe3c`](https://github.com/BeOnAuto/auto-engineer/commit/cc8fe3c016246a1828435911097ccf1da2670d5a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: add InitializeServer command that creates bare runnable server

### Patch Changes

- [`8ea4131`](https://github.com/BeOnAuto/auto-engineer/commit/8ea41315267bc53329d30349e43b45c2a1dbb26d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Removed server from typical example configuration since it now gets initialized automatically

- [`e8137a5`](https://github.com/BeOnAuto/auto-engineer/commit/e8137a584cb6fd7abe224ed57b37d2689d5554bf) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: verify InitializeServer idempotency

- [`53ebdbe`](https://github.com/BeOnAuto/auto-engineer/commit/53ebdbe093fc643a738b3eb0f4e82e657f33120e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: use explicit ESM import paths in generated server.ts

- [`37c049c`](https://github.com/BeOnAuto/auto-engineer/commit/37c049c33910fc9aa99e239ea856e513259e2700) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: mark InitializeServer bursts done in ketchup plan

- [`7f2fba6`](https://github.com/BeOnAuto/auto-engineer/commit/7f2fba647565031da4045bd487c41c0670d36284) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed import formatting and interface property alignment in the Apollo Emmett server generator

- [`931a1a9`](https://github.com/BeOnAuto/auto-engineer/commit/931a1a9e47c146ef77053555d7e0f3c13b0b2b9e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed import formatting and aligned interface property definitions in the Apollo Emmett server generator

- [`d02b74d`](https://github.com/BeOnAuto/auto-engineer/commit/d02b74d3dfaa12a7ee99fe92e1ab5268c440080b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: update ketchup plan for InitializeServer separation

- [`699bd34`](https://github.com/BeOnAuto/auto-engineer/commit/699bd34a6775df9ffcc9c821b3a20778b3c1a285) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **lint**: biome lint fixes

- [`271c1c1`](https://github.com/BeOnAuto/auto-engineer/commit/271c1c10d5a333dddb0f8e6a4e8ee77e04d16374) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Renamed pipeline commands and events across the codebase for improved consistency and clarity

- [`2f32055`](https://github.com/BeOnAuto/auto-engineer/commit/2f320556fa559b8a8b79f925cf09aa032a1622fb) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: verify ServerInitializationFailed on error

- [`0354304`](https://github.com/BeOnAuto/auto-engineer/commit/0354304528ddeabd6c35ad9c7a274327e257f871) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-generator**: export config-writing functions from generate-server

## 1.40.0

### Minor Changes

- [`f50a03d`](https://github.com/BeOnAuto/auto-engineer/commit/f50a03d46f818382d595c3c066eea40a32238b9f) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/generate-react-client**: adds vitest to starter
  - **global**: version packages

- [`6d5da03`](https://github.com/BeOnAuto/auto-engineer/commit/6d5da03d69afc8bdf9152884e9d7b63ca50e028c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added HMR stability settings to the React client generator to prevent rebuild loops during development

### Patch Changes

- [`15938a6`](https://github.com/BeOnAuto/auto-engineer/commit/15938a654785be13c1f7349a1bdb8be1203d93fe) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - enforce Biome as sole formatter in VSCode

- [`8564620`](https://github.com/BeOnAuto/auto-engineer/commit/8564620b2d54b6048551ef246c3f7a1323e554e6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed pipeline crash when child processes exit unexpectedly

- [`79f3806`](https://github.com/BeOnAuto/auto-engineer/commit/79f380644d7d57f2228a03be07e9cbd4c682d6ce) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added convenience dev script for the typical example project

## 1.39.0

### Minor Changes

- [`72300f5`](https://github.com/BeOnAuto/auto-engineer/commit/72300f5bddb195dc5033cc3fda837ecb53e2fbe5) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: integrates graphql
  - **app-implementer**: pass GraphQL schema, queries & mutations into app generation prompt
  - **react-component-implementer**: enforce no hardcoded data in components, MSW-only mocking
  - **react-component-implementer**: pass GraphQL schema, queries & mutations into generation prompt
  - **examples/typical**: updates auto config

- [`d814587`](https://github.com/BeOnAuto/auto-engineer/commit/d814587381c7f291333e4e329ed7ce201bec60eb) Thanks [@osamanar](https://github.com/osamanar)! - - Added Vitest testing framework to the React client starter template

## 1.38.0

### Minor Changes

- [`615aed3`](https://github.com/BeOnAuto/auto-engineer/commit/615aed3bc827845e7d6b691da7979cc61d4390c4) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: add acquireLock and releaseLock with tests

- [`9a8a00e`](https://github.com/BeOnAuto/auto-engineer/commit/9a8a00e759a1104d72ae493a067c68d9a88ff627) Thanks [@osamanar](https://github.com/osamanar)! - - Added support for ensuring GraphQL operations exist in the react component implementer

- [`6c92f68`](https://github.com/BeOnAuto/auto-engineer/commit/6c92f682ba7909385779db0d68562956bcfd19ac) Thanks [@osamanar](https://github.com/osamanar)! - - **app-implementer**: pass GraphQL schema, queries & mutations into app generation prompt

- [`755d452`](https://github.com/BeOnAuto/auto-engineer/commit/755d4527b568b19984524626605707310120700b) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: enforce no hardcoded data in components, MSW-only mocking

- [`9cb506b`](https://github.com/BeOnAuto/auto-engineer/commit/9cb506bea74b8dda139154a83e980dae6842185e) Thanks [@osamanar](https://github.com/osamanar)! - - Added GraphQL integration to the typical example application

- [`01d560a`](https://github.com/BeOnAuto/auto-engineer/commit/01d560a902333c0393c877be781397036523c9b9) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: formatSpecValue parses stringified JSON arrays
  - **server-generator-apollo-emmett**: add events.ts.ejs template for react slices
  - **server-generator-apollo-emmett**: extract react data target events with source then
  - **server-generator-apollo-emmett**: findEventSource checks react data target events
  - **server-generator-apollo-emmett**: given-step state refs get local event types

- [`d3ff854`](https://github.com/BeOnAuto/auto-engineer/commit/d3ff854ff886248678ec9be1ba0e70e6a7124f4c) Thanks [@osamanar](https://github.com/osamanar)! - - Updated auto configuration in the typical example

- [`11753ae`](https://github.com/BeOnAuto/auto-engineer/commit/11753aec8d5d10f195debdbcc56a1caf4eea5a4b) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: wrap ensureGraphqlOperations critical section with lock

- [`902ccfe`](https://github.com/BeOnAuto/auto-engineer/commit/902ccfe838c69a3ae6812e7f034c6798ce022040) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: add concurrent integration test for lock

- [`8e13733`](https://github.com/BeOnAuto/auto-engineer/commit/8e1373303577a0c7428baae2bdfa81b89e5cfb78) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: pass GraphQL schema, queries & mutations into generation prompt

- [`9c5c4f8`](https://github.com/BeOnAuto/auto-engineer/commit/9c5c4f823942e447738f89ffc14bfcc72dcd0ec2) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: re-export acquireLock and releaseLock from index

### Patch Changes

- [`881383b`](https://github.com/BeOnAuto/auto-engineer/commit/881383b338fb0b808f57a525df6252d8a25932cf) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: add ketchup plan for file-based locking

- [`e5d3d12`](https://github.com/BeOnAuto/auto-engineer/commit/e5d3d1252f5d5de8e2d41f34d1da00692ccdb755) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: update ketchup plan — all bursts done

- [`50c8536`](https://github.com/BeOnAuto/auto-engineer/commit/50c85360e7e75523d0cbe55eda3d0408e5ed8221) Thanks [@osamanar](https://github.com/osamanar)! - - **react-component-implementer**: update ketchup plan — graphql prompt passthrough

## 1.37.0

### Minor Changes

- [`81bbf7f`](https://github.com/BeOnAuto/auto-engineer/commit/81bbf7f2e39007674287385cbed21c7b314b2860) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: formatSpecValue parses stringified JSON arrays

- [`3b14b48`](https://github.com/BeOnAuto/auto-engineer/commit/3b14b483e91b9c73cece1d3184f1380a97cd3f3d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: add events.ts.ejs template for react slices

- [`e5030c0`](https://github.com/BeOnAuto/auto-engineer/commit/e5030c04db2654e33f265d6d1e80ff6e87cc7174) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: given-step state refs get local event types

- [`61b27ca`](https://github.com/BeOnAuto/auto-engineer/commit/61b27ca1f3826fc89dcd14242b69bc47bac37a9f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: findEventSource checks react data target events

- [`9c6fa84`](https://github.com/BeOnAuto/auto-engineer/commit/9c6fa84191f381b47b883acac519f3396afe18dd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: extract react data target events with source then

### Patch Changes

- [`60f46ad`](https://github.com/BeOnAuto/auto-engineer/commit/60f46ad27b9de630540c1ca1214589a938410c6c) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan — all bursts done

- [`db121c4`](https://github.com/BeOnAuto/auto-engineer/commit/db121c47c6ff2ce217211bc457ef18dcac3ca88d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: update ketchup plan for event resolution bugs

- [`d47fc5c`](https://github.com/BeOnAuto/auto-engineer/commit/d47fc5c65a19cbee2f4ad6595cb3cb97f572e8be) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: increase retry delays for Storybook connection
  - **global**: version packages

## 1.36.3

### Patch Changes

- [`318c6d0`](https://github.com/BeOnAuto/auto-engineer/commit/318c6d06322ecdc912ec4b00f0deac5c977dbe6f) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: pnpm frozen files
  - **dev-server**: add --no-frozen-lockfile to all pnpm install commands
  - **global**: version packages
  - **global**: version packages

- [`06ac197`](https://github.com/BeOnAuto/auto-engineer/commit/06ac197d20977a5cd0c282fa0f768bd32155b365) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Increased retry delays for Storybook connection to improve reliability when waiting for the dev server to become available

## 1.36.2

### Patch Changes

- [`f12db1f`](https://github.com/BeOnAuto/auto-engineer/commit/f12db1f00c39e655dc33e8b482f06bf677b7675b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **dev-server**: add --no-frozen-lockfile to all pnpm install commands
  - **global**: version packages

- [`784037d`](https://github.com/BeOnAuto/auto-engineer/commit/784037d7fcc521e47caea4ef1785d1d6962057df) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed frozen lockfile issues in the dev server's package installation

## 1.36.1

### Patch Changes

- [`f47ecfb`](https://github.com/BeOnAuto/auto-engineer/commit/f47ecfbfa44ac9143e4a578354b8d4f64392f72f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: add --no-frozen-lockfile to all pnpm install commands

- [`7ede352`](https://github.com/BeOnAuto/auto-engineer/commit/7ede35258de9feecb36fc37e6107b2b648c07939) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **typical**: remove components-db.json file

## 1.36.0

### Minor Changes

- [`4cc9c2c`](https://github.com/BeOnAuto/auto-engineer/commit/4cc9c2cf1b84791f281bdc99f041a2985c7ec5be) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: implement commands for building and installing client/server dependencies
  - **typical**: generate components-db.json with 57 merged components
  - **typical**: add build:component-db npm script
  - **typical**: add build-component-db script merging Storybook manifests
  - **generate-react-client**: component documentation with detailed descriptions and examples

### Patch Changes

- [`3781180`](https://github.com/BeOnAuto/auto-engineer/commit/378118097bdef4189cfafc2bc8a5b5694b236608) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Removed unused components database file from the typical example project

## 1.35.0

### Minor Changes

- [`ee955cf`](https://github.com/BeOnAuto/auto-engineer/commit/ee955cf5245cce3ecf1b4c08e625a6c0e8586d1f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added detailed component documentation with descriptions and usage examples for generated React client components

- [`4568aea`](https://github.com/BeOnAuto/auto-engineer/commit/4568aeace396e4d8ed9fce4639588ac7b5bc9f48) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: add build-component-db script merging Storybook manifests

- [`f8615fc`](https://github.com/BeOnAuto/auto-engineer/commit/f8615fcc5ed2df1eaa29a454b8dcd50bc38ef18c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: component documentation with detailed descriptions and examples
  - **generate-react-client**: udpate starter
  - **global**: version packages
  - **root**: remove unused .claude.hooks.json and tsconfig.staging.json files

- [`7dfc266`](https://github.com/BeOnAuto/auto-engineer/commit/7dfc2663f415f4c30c1355fa839017f689e19dfc) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: generate components-db.json with 57 merged components

- [`2b17ba5`](https://github.com/BeOnAuto/auto-engineer/commit/2b17ba5b0120f949ef81555ea36ab45fd93de3e0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: add build:component-db npm script

- [`fe3ec48`](https://github.com/BeOnAuto/auto-engineer/commit/fe3ec48a7b9ed71c0e3c7edc7cbe9ee4f9bffd06) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added commands for building and installing client and server dependencies in the typical example project

### Patch Changes

- [`2672e53`](https://github.com/BeOnAuto/auto-engineer/commit/2672e536679d7f56f2f6f7bf96e4655059697847) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **root**: build components database script plan

- [`c4669b8`](https://github.com/BeOnAuto/auto-engineer/commit/c4669b8a71153ea7fd2f4a60e0c88d23829119d6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **typical**: use tsx for build:component-db script

- [`c558551`](https://github.com/BeOnAuto/auto-engineer/commit/c558551c1ae3be91aa0139a675fcc972662af9de) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Improved Storybook startup detection with retry logic and configurable delay for more reliable component preview launching

- [`ae00d8a`](https://github.com/BeOnAuto/auto-engineer/commit/ae00d8a71c12bc707739cb1dcf6c724d7bb3af73) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Centralized the starter configuration in the typical example for simpler project setup

## 1.34.0

### Minor Changes

- [`e058a06`](https://github.com/BeOnAuto/auto-engineer/commit/e058a0650c2e32dfb8854e04ee410e058d0178fc) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added detailed component documentation with descriptions and usage examples

- [`3a661a2`](https://github.com/BeOnAuto/auto-engineer/commit/3a661a2d5de691618125d74fb0426e13eb7bdac8) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated starter template for React client generation

### Patch Changes

- [`cf89a5b`](https://github.com/BeOnAuto/auto-engineer/commit/cf89a5bbb7e9301c8381bdff9d86a00e84f7072c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Removed unused configuration files to clean up the project root

- [`9cec043`](https://github.com/BeOnAuto/auto-engineer/commit/9cec04374526611a1e8857dc3e379a091cfc5177) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **typical**: update .gitignore and improve Storybook configuration for better theme handling
  - **global**: version packages

## 1.33.0

### Minor Changes

- [`e363390`](https://github.com/BeOnAuto/auto-engineer/commit/e363390510be416be1d45180295fe2216b141f5d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: adds graphql codegen
  - **generate-react-client**: add graphql-codegen to starter template
  - update lockfile after version packages
  - **global**: version packages

### Patch Changes

- [`699e647`](https://github.com/BeOnAuto/auto-engineer/commit/699e647db09a70816579c5da0c21a9f5f62d9f28) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated .gitignore to exclude generated files from version control
  - Improved Storybook configuration for better theme handling

## 1.32.0

### Minor Changes

- [`1d90054`](https://github.com/BeOnAuto/auto-engineer/commit/1d90054c4a0edbda09ace0087522a2cab1d95f6c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: add graphql-codegen to starter template

- [`554e0b3`](https://github.com/BeOnAuto/auto-engineer/commit/554e0b39ee94d80447e64fb45af8633a16c3b1f5) Thanks [@osamanar](https://github.com/osamanar)! - - Added GraphQL code generation support to the typical example project

### Patch Changes

- [`65d3245`](https://github.com/BeOnAuto/auto-engineer/commit/65d3245af36c24c59f24936cc7ea0c166d69f2d4) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-component-implementer**: revert back to last good version
  - **global**: version packages

- [`1fcf76e`](https://github.com/BeOnAuto/auto-engineer/commit/1fcf76eb33d77530c0c1062453889138ef6972ee) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - update lockfile after version packages

## 1.31.0

### Minor Changes

- [`34fc5c6`](https://github.com/BeOnAuto/auto-engineer/commit/34fc5c68762de1a9818718fcdc09863776c00165) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **generate-react-client**: add postMessage-based iframe navigation tracking
  - **global**: version packages

### Patch Changes

- [`b806ddb`](https://github.com/BeOnAuto/auto-engineer/commit/b806ddb05cffe726629745e5609c9bed1328b131) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Reverted react component implementer to last known stable version to restore reliability

## 1.30.0

### Minor Changes

- [`2181802`](https://github.com/BeOnAuto/auto-engineer/commit/21818027dc5db0ab2b69116e7dae4ed458fa6c3d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: use .declare().accepts() in auto.config.ts
  - **pipeline**: add .declare() to EmitChain, SettledChain, HandleChain
  - **pipeline**: add AcceptsDescriptor type and .declare().accepts() builder
  - **react-component-implementer**: parallelize type check and browser validation
  - **react-component-implementer**: wire mcp-pool for connection reuse

- [`b095ae5`](https://github.com/BeOnAuto/auto-engineer/commit/b095ae52b9574566f64cc194b8567a001ae1210c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **generate-react-client**: add postMessage-based iframe navigation tracking

## 1.29.0

### Minor Changes

- [`2ef9632`](https://github.com/BeOnAuto/auto-engineer/commit/2ef9632a2db081f201981422f2ba26b026fa7277) Thanks [@SamHatoum](https://github.com/SamHatoum)! - ### react-component-implementer
  - Add staging workflow with `writeStagedStory`, `checkStagedTypes`, and `promoteFromStaging`
  - Add MCP connection pool and browser pool for resource reuse
  - Add context filtering and system prompt caching to reduce tokens
  - Add ts-service for type-aware error feedback with property suggestions
  - Parallelize type checking and browser validation
  - Replace score-based visual evaluation with binary ACK/NACK criteria
  - Enable incremental TypeScript checking in staging

  ### pipeline
  - Add `.declare().accepts()` builder for AcceptsDescriptor type
  - Show source commands in pipeline graph

  ### job-graph-processor
  - Add `hasFailedJobs` utility and discriminate GraphProcessed vs GraphProcessingFailed
  - Bridge context.emit in command handler for downstream event routing

  ### server-generator-apollo-emmett
  - Add cleanServerDir to preserve node_modules during regeneration
  - Accept Model directly instead of modelPath

  ### server-generator-nestjs
  - Accept Model directly instead of modelPath

  ### generate-react-client
  - Lock in overwrite behavior for copyStarter

  ### narrative
  - Remove export-schema command

  ### global
  - Remove references to information-architect and model-diff packages
  - Fix biome lint errors for CI compliance
  - Update examples and configuration files

## 1.28.0

### Minor Changes

- [`251372b`](https://github.com/BeOnAuto/auto-engineer/commit/251372b0731f95f5ea38413bc40f6cab01fb7342) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed issues with the React component implementer to improve reliability

- [`817d4a3`](https://github.com/BeOnAuto/auto-engineer/commit/817d4a386b205fc28da93fca6784b9ce9ec81990) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **react-component-implementer**: fix import errors
  - **react-component-implementer**: fix import errors
  - **typical**: improve fast mode detection and enhance command handler structure
  - **global**: version packages
  - **job-graph-processor**: standardize event naming and improve documentation

## 1.27.0

### Minor Changes

- [`5492d59`](https://github.com/BeOnAuto/auto-engineer/commit/5492d59747e36f36b923f5cb038e2310f38861a4) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed import errors in the React component implementer

- [`518e049`](https://github.com/BeOnAuto/auto-engineer/commit/518e049e728f716830befdfa415ba45d8fd16358) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed import errors in the React component implementer

### Patch Changes

- [`51a6090`](https://github.com/BeOnAuto/auto-engineer/commit/51a609026825da9841b750b1e70a48809e33be63) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **server-generator-apollo-emmett**: harden template type resolution and add implementer hints
  - **global**: version packages

- [`5d7fc3d`](https://github.com/BeOnAuto/auto-engineer/commit/5d7fc3d9a13205adbebec6463aa5533065b8775c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Improved fast mode detection for more reliable behavior when toggling between standard and fast modes
  - Enhanced command handler structure for better internal organization and maintainability

- [`c23b5b7`](https://github.com/BeOnAuto/auto-engineer/commit/c23b5b7daa777a302b9824e8ca0f1bd4d4ea9ab9) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Standardized event naming conventions in the job graph processor for more consistent behavior
  - Improved internal documentation for job graph processing logic

## 1.26.1

### Patch Changes

- [`7c50bd0`](https://github.com/BeOnAuto/auto-engineer/commit/7c50bd01d21e5181461f721de0b5b225e910b35e) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: allow service token reconfiguration on toggle
  - **global**: version packages

- [`5f6e775`](https://github.com/BeOnAuto/auto-engineer/commit/5f6e775fa548ae918c575ad30ed68c3fd4042955) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - **server-generator-apollo-emmett**: harden template type resolution and add implementer hints

## 1.26.0

### Minor Changes

- [`5878dff`](https://github.com/BeOnAuto/auto-engineer/commit/5878dff837d24cfca9636fc2d40b53797d84e303) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: add allowReconfigure option to createServiceTokenStore
  - **typical**: enhance dark mode support and improve theme styling in Storybook
  - **typical**: implement dark mode support and enhance Storybook configuration
  - **typical**: add dark mode support and navigation sync
  - **typical**: pipeline config

### Patch Changes

- [`65eb8c6`](https://github.com/BeOnAuto/auto-engineer/commit/65eb8c69ee311438a9c97dc842c9cc9417f54624) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: allow service token reconfiguration on toggle

## 1.25.0

### Minor Changes

- [`fd5ebeb`](https://github.com/BeOnAuto/auto-engineer/commit/fd5ebeb9ab4b483ce7e6e19858067095e47ff11d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Enhanced dark mode support and improved theme styling in Storybook

- [`151010e`](https://github.com/BeOnAuto/auto-engineer/commit/151010e12aecf454be98d519d8189b3ae73be437) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add allowReconfigure option to createServiceTokenStore

- [`1f5219c`](https://github.com/BeOnAuto/auto-engineer/commit/1f5219c7e932c2fc5beb79be82f4c9eaa2c2e46d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added dark mode support for the design system
  - Enhanced Storybook configuration for improved component previewing

- [`eef8137`](https://github.com/BeOnAuto/auto-engineer/commit/eef8137d39f2c44919d136d0ca55c95c28f8c0da) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added dark mode support for improved visual comfort in low-light environments
  - Synchronized navigation state to maintain consistent active indicators across views

### Patch Changes

- [`8cfe38d`](https://github.com/BeOnAuto/auto-engineer/commit/8cfe38d10b1f8430c43f85f0cd745f04c03f5095) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed pipeline configuration for typical setup

- [`f4d58b9`](https://github.com/BeOnAuto/auto-engineer/commit/f4d58b9b8b0be9401728ad1252b6757071485178) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: verify middleware returns 200 on reconfigure with allowReconfigure

- [`b549656`](https://github.com/BeOnAuto/auto-engineer/commit/b549656a11be392301e56c35ba14ca8a9748c804) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated button styling in the Survey Options demo component for a more consistent look

- [`ed9b7d0`](https://github.com/BeOnAuto/auto-engineer/commit/ed9b7d0874b583ca712278d8aa4b498966a0e7ff) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: update ketchup plan for allowReconfigure feature

- [`34209a4`](https://github.com/BeOnAuto/auto-engineer/commit/34209a487e1727ce7515b7a889cf2ec19e1e41d2) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Improved dark mode handling for better visual consistency

- [`5a58a63`](https://github.com/BeOnAuto/auto-engineer/commit/5a58a6365f79d76ce3e5765e64b6a037bdc4819c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: improve 409 /configure error message to suggest restart
  - **global**: version packages

- [`40e90b1`](https://github.com/BeOnAuto/auto-engineer/commit/40e90b14cf4d465a329c05b80b5c32f70e702d26) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated layout and spacing in the Design System Overview component for improved visual consistency

- [`f4d58b9`](https://github.com/BeOnAuto/auto-engineer/commit/f4d58b9b8b0be9401728ad1252b6757071485178) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added test coverage verifying the reconfigure endpoint returns 200 when allowReconfigure is enabled

- [`bfb0419`](https://github.com/BeOnAuto/auto-engineer/commit/bfb0419b6a18ab4927adc8030edb05e3c22f9b10) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated avatar images and improved styling in the empty avatar group display

## 1.24.0

### Minor Changes

- [`1d93846`](https://github.com/BeOnAuto/auto-engineer/commit/1d93846608832d9f9b98cb845028eeef9cc6795d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: enhance component stories with consistent titles and add design system overview
  - **typical**: storybook fast mode and add new design system overview stories
  - **dev-server**: copy storybook settings in start command
  - **typical**: update auto:debug script to include --no-tui flag
  - **typical**: adjust column widths and overflow comments for better responsiveness

### Patch Changes

- [`83a9a23`](https://github.com/BeOnAuto/auto-engineer/commit/83a9a234fa1fb4d6f89e93065470427212209a7e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: improve 409 /configure error message to suggest restart

## 1.23.0

### Minor Changes

- [`370b36e`](https://github.com/BeOnAuto/auto-engineer/commit/370b36e2c871966520e906559e1369e41312843f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added automatic copying of Storybook settings when running the dev server start command

- [`929c38d`](https://github.com/BeOnAuto/auto-engineer/commit/929c38de2d5a78f90aa7c3441a2d00978678ffde) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: /configure endpoint bypasses tunnel auth middleware
  - **cli**: tunnel auth accepts x-service-token via ServiceTokenStore
  - **cli**: add createServiceTokenStore and createConfigureMiddleware
  - **global**: version packages
  - **root**: update claude-auto

- [`156aee3`](https://github.com/BeOnAuto/auto-engineer/commit/156aee35fe0ab25cb895c541840646557c649a83) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Enhanced component stories with consistent titles across the design system
  - Added new design system overview documentation

- [`6de131b`](https://github.com/BeOnAuto/auto-engineer/commit/6de131b629a13314dd513eccd8238daabc401860) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added Storybook fast mode for quicker component development iteration
  - Added new design system overview stories for better documentation and visibility of UI components

### Patch Changes

- [`8ccfd99`](https://github.com/BeOnAuto/auto-engineer/commit/8ccfd99f84cad415bd2e0908a1e25116ab3ef166) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Adjusted column widths and overflow handling for better responsiveness in the design system

- [`d399c35`](https://github.com/BeOnAuto/auto-engineer/commit/d399c352d2bf8fdab51d4421f6d7b2fc63716dc3) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated the debug script to include the --no-tui flag for headless debugging support

- [`eacc928`](https://github.com/BeOnAuto/auto-engineer/commit/eacc92850393761587cefb982b83a3798f4f1390) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: register /configure middleware in all modes, not just tunnel

- [`99c4e36`](https://github.com/BeOnAuto/auto-engineer/commit/99c4e3654624903024ae628b55fcce20cf1bd96f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Removed outdated ngrok tunnel support plan

## 1.22.0

### Minor Changes

- [`06e7743`](https://github.com/BeOnAuto/auto-engineer/commit/06e7743c10c929e185cc89c3acb6eff471df8cc5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: /configure endpoint bypasses tunnel auth middleware

- [`3c32caa`](https://github.com/BeOnAuto/auto-engineer/commit/3c32caa928eca60868e33e0df5c7c8c4f9e04f16) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add createServiceTokenStore and createConfigureMiddleware

- [`ead2ad3`](https://github.com/BeOnAuto/auto-engineer/commit/ead2ad3d991e860a5590cb63a24fb07d8cbdf5dd) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: tunnel auth accepts x-service-token via ServiceTokenStore

### Patch Changes

- [`59c4705`](https://github.com/BeOnAuto/auto-engineer/commit/59c470536b67b15ce7de6a9283d469acbd31e82d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated internal tooling dependencies

- [`cdacfde`](https://github.com/BeOnAuto/auto-engineer/commit/cdacfde287140bd844c9b3d5cb560cb11bed3e9a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: bearer token still works after service token configured

- [`952f791`](https://github.com/BeOnAuto/auto-engineer/commit/952f7917fb5203c5e5007a314c6f15d52de96be1) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: second POST /configure returns 409

- [`55f4767`](https://github.com/BeOnAuto/auto-engineer/commit/55f4767dfba88349f276f1f9e060c99aac1b82dc) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: increase timeout for getNarratives cache tests
  - **root**: fix changelog extraction for GitHub releases
  - **global**: version packages
  - **global**: update claude-auto

## 1.21.0

### Minor Changes

- [`34c3f15`](https://github.com/BeOnAuto/auto-engineer/commit/34c3f1582e62167508b3239c8a4307f805489f38) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: update allowedHosts in Vite config for client and starter packages
  - **cli**: prevent race condition in server tests
  - **global**: version packages
  - **cli**: increase timeout for watchDir and fileSync.dir tests
  - **root**: add build dependency to type-check task

### Patch Changes

- [`925fb0d`](https://github.com/BeOnAuto/auto-engineer/commit/925fb0d0bc5032b4e623daa7a47e91bddce3f7ae) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated claude-auto dependency to latest version

- [`a27353e`](https://github.com/BeOnAuto/auto-engineer/commit/a27353e2713fd017df513030eee8990b57ed3cb3) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed changelog extraction for GitHub releases

- [`2550230`](https://github.com/BeOnAuto/auto-engineer/commit/2550230881be06ccd1620e8499831201e5408d28) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **narrative**: increase timeout for getNarratives cache tests

## 1.20.0

### Minor Changes

- [`1a07f67`](https://github.com/BeOnAuto/auto-engineer/commit/1a07f67e1e6dfe381866507408374e52361636b6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Updated allowed hosts configuration in Vite for client and starter packages to support additional development and deployment environments

### Patch Changes

- [`127dfff`](https://github.com/BeOnAuto/auto-engineer/commit/127dfff9e568687f44c10541628ccb5cbd849f77) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed a race condition in server tests to improve test reliability

- [`9f67ac0`](https://github.com/BeOnAuto/auto-engineer/commit/9f67ac02e09ea502ee8b802519d9d852ef475330) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: remove stale package names from changesets
  - **server-generator-apollo-emmett**: emit SliceGenerated events on no-change path
  - **server-generator-apollo-emmett**: use raw projectionName for collectionName
  - **narrative**: handle Array<T> type arguments in extractTypeReference
  - **global**: version packages

- [`a38050e`](https://github.com/BeOnAuto/auto-engineer/commit/a38050e1942287ee6ada6ae97645d1f08b0bcb10) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Increased test timeouts for file watching and directory sync tests to improve test reliability

- [`0aa6411`](https://github.com/BeOnAuto/auto-engineer/commit/0aa6411d2c6907b7c96894c250588dcd3a43324b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added build dependency to the type-check task to ensure builds complete before type checking runs

## 1.19.0

### Minor Changes

- [`af79665`](https://github.com/BeOnAuto/auto-engineer/commit/af7966518d3496ce0880323756aa572df3da640a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: ngrok tunnel mode, TUI mode for better visibility
  - **cli**: improve AutoTab display with remote access hint
  - **dev-server**: use piped output in TUI mode
  - **cli**: add ServiceRegistry to server and global accessor
  - **cli**: integrate TUI as default startup mode

### Patch Changes

- [`7c663c2`](https://github.com/BeOnAuto/auto-engineer/commit/7c663c23988a086d738b47735c1b5369f98faccb) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated project tracking plan to mark completed work items

- [`189a5b4`](https://github.com/BeOnAuto/auto-engineer/commit/189a5b4e22c10b0a43debae44c3a0df74c0612c3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed collection name case mismatch in Apollo/Emmett server generator that caused projection tests to fail

- [`189a5b4`](https://github.com/BeOnAuto/auto-engineer/commit/189a5b4e22c10b0a43debae44c3a0df74c0612c3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed narrative type extraction to correctly handle generic types like Array<T>, producing accurate output such as "Array<{ name: string }>" instead of just "Array"

- [`6969856`](https://github.com/BeOnAuto/auto-engineer/commit/6969856d3d017cf14829a2235b1b02e2c65ce77f) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed pipeline stalling when no schema changes are detected by ensuring slice generation events are always emitted
  - Resolved issue where implementation steps would never trigger after a no-change scaffold generation

- [`2472cba`](https://github.com/BeOnAuto/auto-engineer/commit/2472cba432d6c99f86aa2850ada1016b215c71d5) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Updated the ketchup plan for the Apollo-Emmett server generator with bursts 8-9

- [`b9f5389`](https://github.com/BeOnAuto/auto-engineer/commit/b9f53894162680342a23eaa95d46e17e69d8f5dd) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Upgraded AI SDK from v5 to v6 across all packages to resolve version compatibility issues with the Anthropic provider

- [`776f131`](https://github.com/BeOnAuto/auto-engineer/commit/776f13124487782819f8586b541c32ec311f49d7) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed narrative type extraction to correctly handle generic types like Array<T>, producing accurate output such as "Array<{ name: string }>" instead of just "Array"

## 1.18.0

### Minor Changes

- [`4318041`](https://github.com/BeOnAuto/auto-engineer/commit/4318041b4440bcbda9e6f3ef1eb448b5c42fe111) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add ServiceRegistry to server and global accessor

- [`bbd1ec6`](https://github.com/BeOnAuto/auto-engineer/commit/bbd1ec6bac6f378b99ae8727cc88e1cdb9236783) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add TUI entry point with renderTui function

- [`3be579a`](https://github.com/BeOnAuto/auto-engineer/commit/3be579a34ac90caf0425be922b286ee2f4ff95ee) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **dev-server**: use piped output in TUI mode

- [`0a72b70`](https://github.com/BeOnAuto/auto-engineer/commit/0a72b705ebb74e71df40b9c939723e4d242e0a96) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add ServiceHandle and ServiceRegistry for TUI

- [`0f5f2c5`](https://github.com/BeOnAuto/auto-engineer/commit/0f5f2c5ba51c46ac0594f031d6c700ef17e96785) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add Footer component for TUI

- [`052148f`](https://github.com/BeOnAuto/auto-engineer/commit/052148f8c73cd6fe2fc3b4c73567c2980be7b816) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add App component with keyboard handling

- [`442ad2d`](https://github.com/BeOnAuto/auto-engineer/commit/442ad2dd2d4918008ce73512e4edf49df348ba29) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: add --tunnel flag with auth middleware wiring and console output
  - **cli**: extend AutoConfig with tunnel config and resolve defaults
  - **cli**: startTunnel wraps ngrok.forward with error handling
  - **cli**: add @ngrok/ngrok dependency and tunnelUrl to ServerHandle
  - **cli**: createTunnelSocketMiddleware with localhost bypass and token auth

- [`e972f8f`](https://github.com/BeOnAuto/auto-engineer/commit/e972f8f38b631bfa9124f220fd44b641506a0c4c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: improve AutoTab display with remote access hint

- [`5bf3089`](https://github.com/BeOnAuto/auto-engineer/commit/5bf3089bef242f8fc44aac1dd12f94f7f219167d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: rename Summary tab to Auto tab

- [`60c62e0`](https://github.com/BeOnAuto/auto-engineer/commit/60c62e0f276e826e6d318bdcdde16b509f116666) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add AutoTab component with server endpoints display

- [`e2616d4`](https://github.com/BeOnAuto/auto-engineer/commit/e2616d4b6aed2444684c2e2fa14e952f0de660b0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add Dashboard component for TUI

- [`685f429`](https://github.com/BeOnAuto/auto-engineer/commit/685f4295e7e87a80fd310c95caac78d16ef7f901) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added ngrok tunnel mode for remote access to the dev server
  - Introduced TUI (Terminal UI) as the default startup mode for better visibility and status monitoring

- [`78c49a9`](https://github.com/BeOnAuto/auto-engineer/commit/78c49a9eff9790ce0ea1c8e027d27ca5bf35adc4) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add SummaryTab component for TUI

- [`cbdfbdd`](https://github.com/BeOnAuto/auto-engineer/commit/cbdfbdd9c6e05d2c8e583b7bba7e3888c2ab2054) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add LogBuffer for TUI log buffering

- [`3bec017`](https://github.com/BeOnAuto/auto-engineer/commit/3bec0171827f005dcfaa1519b58eebf0fe26d875) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add wireServiceStream for TUI log piping

- [`210e97c`](https://github.com/BeOnAuto/auto-engineer/commit/210e97c5210e66197f4d91fe2fb1cc1b8ff8bc5b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add ServiceTab component for TUI

- [`5de2847`](https://github.com/BeOnAuto/auto-engineer/commit/5de2847e745a77b1359d192c651fae4bb3b89f1e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: integrate TUI as default startup mode

- [`aa8202a`](https://github.com/BeOnAuto/auto-engineer/commit/aa8202aab81ea0a672c439a975ebe19c8a4bb446) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add TabBar component for TUI

### Patch Changes

- [`f16f4d3`](https://github.com/BeOnAuto/auto-engineer/commit/f16f4d35d3c05e77445c762a41ce13494d8e56fb) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: update App to use serverInfo prop

- [`4af0b7f`](https://github.com/BeOnAuto/auto-engineer/commit/4af0b7fefe51512b522ce84d309d7dec4d075f6e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add ink-testing-library and JSX support

- [`446d0aa`](https://github.com/BeOnAuto/auto-engineer/commit/446d0aa7b8d7b3a9165387156a6735880f9cd1d5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add ink, react, @inkjs/ui dependencies for TUI

- [`27f3784`](https://github.com/BeOnAuto/auto-engineer/commit/27f3784d5450f19f8ce71f64ce9749eefa3cd2d3) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **ci**: skip pre-commit hook on version commit, reset index before publish

- [`1776619`](https://github.com/BeOnAuto/auto-engineer/commit/1776619849592fedad8ba8a62413be919f450485) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: update renderTui to accept serverInfo

- [`e063e5e`](https://github.com/BeOnAuto/auto-engineer/commit/e063e5e85674b0d518a1e971f9056c1471f79b5d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: update Dashboard to use serverInfo and AutoTab

- [`6a6659f`](https://github.com/BeOnAuto/auto-engineer/commit/6a6659f68883dafb496b34b13fd0b3a93141dd5a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: remove unused SummaryTab spec file

## 1.17.0

### Minor Changes

- [`1c01e14`](https://github.com/BeOnAuto/auto-engineer/commit/1c01e14465f1af7b969dad9c3b45cfa66f653d67) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: createTunnelSocketMiddleware with localhost bypass and token auth

- [`8a62e25`](https://github.com/BeOnAuto/auto-engineer/commit/8a62e2566fb65e94c1bb1b742659246913f4739f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: generateBearerToken returns 64-char hex string

- [`c53ab86`](https://github.com/BeOnAuto/auto-engineer/commit/c53ab8648700dde4c7e49002b691382518ee39fa) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: startTunnel wraps ngrok.forward with error handling

- [`8a62e25`](https://github.com/BeOnAuto/auto-engineer/commit/8a62e2566fb65e94c1bb1b742659246913f4739f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: createTunnelAuthMiddleware with localhost bypass and bearer auth

- [`a2b91f1`](https://github.com/BeOnAuto/auto-engineer/commit/a2b91f1fb37a3ebe1f074988c65ebbb88af8a1e8) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add @ngrok/ngrok dependency and tunnelUrl to ServerHandle

- [`99da060`](https://github.com/BeOnAuto/auto-engineer/commit/99da060bc7450858ecf75a916ae3ed4243896ab2) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **ai-gateway**: delete ai-gateway package, clean all references
  - **app-implementer**: migrate from openai-compatible to model-factory + fix usage token names
  - **react-component-implementer**: migrate from openai-compatible to model-factory
  - **server-implementer**: migrate from ai-gateway to model-factory + ai SDK
  - **information-architect**: migrate from ai-gateway to model-factory + ai SDK

- [`5707573`](https://github.com/BeOnAuto/auto-engineer/commit/5707573716dc35775fa09e079274acac2a2caa42) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: generateBearerToken returns 64-char hex string

- [`40b7fb6`](https://github.com/BeOnAuto/auto-engineer/commit/40b7fb666b14cf2f51e28a038248f3684561ddf5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add --tunnel flag with auth middleware wiring and console output

- [`b8d1575`](https://github.com/BeOnAuto/auto-engineer/commit/b8d157544cfce93f46691885d52f664688a1338a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: extend AutoConfig with tunnel config and resolve defaults

- [`a8c570a`](https://github.com/BeOnAuto/auto-engineer/commit/a8c570a2e4132cf99dbdc0e19a1d6f6ceb407a53) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add --tunnel flag with auth middleware wiring and console output

### Patch Changes

- [`acd8ec7`](https://github.com/BeOnAuto/auto-engineer/commit/acd8ec79fe1947325deba60b233be79d50304723) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: apply biome formatting to startServer parameter object

- [`ff19dff`](https://github.com/BeOnAuto/auto-engineer/commit/ff19dff9989064bb46510284345834bdcb622899) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: replace tunnel tip with actionable Remote Access section

- [`265d86d`](https://github.com/BeOnAuto/auto-engineer/commit/265d86d864185328b418f5d90c0a4c3197e0e0eb) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: add ketchup plan for ngrok tunnel support

- [`40b7fb6`](https://github.com/BeOnAuto/auto-engineer/commit/40b7fb666b14cf2f51e28a038248f3684561ddf5) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **cli**: document tunnel config in auto.config.example.ts

## 1.16.0

### Minor Changes

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`ed427ed`](https://github.com/BeOnAuto/auto-engineer/commit/ed427ed63f68376725d3e14e67446b7b6ac396cd) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **information-architect**: migrate from ai-gateway to model-factory + ai SDK

- [`5bf2927`](https://github.com/BeOnAuto/auto-engineer/commit/5bf2927141e1002ff0fb0e6ad7ab8d8f0c6ba651) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: add client and server into typical example for improved loading speed
  - **global**: prevent postinstall from dirtying tree in CI
  - **global**: version packages

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`1febc56`](https://github.com/BeOnAuto/auto-engineer/commit/1febc560a82b98181e8ae97e99677c0c8cd3e446) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **model-factory**: createModelFromEnv custom provider path

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`9d8dd33`](https://github.com/BeOnAuto/auto-engineer/commit/9d8dd3376385e674b09aa7b4b305dc6e5da5b97a) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **model-factory**: add direct providers (openai, anthropic, google, xai)

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`40206ec`](https://github.com/BeOnAuto/auto-engineer/commit/40206ec9d0a0f97864f5e5caa2fc32e4f21a3110) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-implementer**: migrate from ai-gateway to model-factory + ai SDK

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`4f9d95d`](https://github.com/BeOnAuto/auto-engineer/commit/4f9d95d0618492f84ce93abe78184b57673a477d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **app-implementer**: migrate from openai-compatible to model-factory + fix usage token names

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`099c11a`](https://github.com/BeOnAuto/auto-engineer/commit/099c11a86d6f1a8161336cba110d28fec004a098) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **react-component-implementer**: migrate from openai-compatible to model-factory

- [`0513f41`](https://github.com/BeOnAuto/auto-engineer/commit/0513f41ad51987030886a220e0c256a088123100) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added automatic PipelineStarted event emission when the server starts, enabling listeners to react to pipeline initialization

### Patch Changes

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`9c61c88`](https://github.com/BeOnAuto/auto-engineer/commit/9c61c88d99d523b3a9d3b996216b0ed3a36bcc8c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **model-factory**: scaffold package infra

- [`984aeeb`](https://github.com/BeOnAuto/auto-engineer/commit/984aeeb98238a8d102d17605367dfa9f2a0d9d49) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: align ai sdk version to v5 across all packages

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`78a4e38`](https://github.com/BeOnAuto/auto-engineer/commit/78a4e385914489983d61ff65d09f1d8a60fcf11e) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **app-implementer**: resolve pre-existing type errors with LanguageModelUsage

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`2df8afd`](https://github.com/BeOnAuto/auto-engineer/commit/2df8afd138a3ddaf169a422690ef2996342adb0d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - update pnpm-lock.yaml after ai-gateway deletion

- [`a275e11`](https://github.com/BeOnAuto/auto-engineer/commit/a275e116f93f0a6c0f05201c467245022f24f694) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: update @ai-sdk/openai-compatible to v2 for ai sdk v5 compat

- [`7fdd60b`](https://github.com/BeOnAuto/auto-engineer/commit/7fdd60b24e787b8ea75eab5a6cff1c8c4b478a99) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **ai-gateway**: update ai-sdk providers to v3 for ai@5 compatibility

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`ea8eacc`](https://github.com/BeOnAuto/auto-engineer/commit/ea8eaccdc827103bf79cb272a0c6ac12706b8580) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **information-architect**: reduce complexity in validateCompositionReferences

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`5a1e21f`](https://github.com/BeOnAuto/auto-engineer/commit/5a1e21f1a1351688210a88896983c3f11f6400e6) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - apply biome formatting to scripts/dev.ts

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`d87a560`](https://github.com/BeOnAuto/auto-engineer/commit/d87a560fa41044e1cca4d5995a8f04aaeeed80ee) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **model-factory**: return LanguageModel from ai SDK for consumer compatibility

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`390e9e2`](https://github.com/BeOnAuto/auto-engineer/commit/390e9e20d4fd9529ef7a74dcf07ac7cde50d379c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **model-factory**: apply biome formatting to index.specs.ts

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`3f5efbb`](https://github.com/BeOnAuto/auto-engineer/commit/3f5efbbdf58215b4634c15c4070c3c5cd96ce7a2) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - update ketchup plan — mark bursts 1-10 done

- [#45](https://github.com/BeOnAuto/auto-engineer/pull/45) [`ed42a22`](https://github.com/BeOnAuto/auto-engineer/commit/ed42a222e11d9ff437040f9d0da756bec3992775) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **server-implementer**: fix import order and line formatting in implement-slice.ts

## 1.15.0

### Minor Changes

- [`c94c72e`](https://github.com/BeOnAuto/auto-engineer/commit/c94c72ea47ee902caff8e41e6fdeee6d514fff5d) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: adds app implementer to auto config
  - **global**: version packages

- [`a8a75f0`](https://github.com/BeOnAuto/auto-engineer/commit/a8a75f058bc9f640294c46a4e62f24de28e90d2f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added client and server integration to the typical example for improved loading speed

### Patch Changes

- [`08b53d0`](https://github.com/BeOnAuto/auto-engineer/commit/08b53d0063263fca60d781ded67b50cfbcb1974f) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed an issue where the postinstall script could dirty the git tree in CI environments
  - Improved publish reliability by resetting the working tree before pulling latest changes

## 1.14.0

### Minor Changes

- [`e510647`](https://github.com/BeOnAuto/auto-engineer/commit/e5106475bdaf045a7b68ed2c0a48557a235ef87c) Thanks [@osamanar](https://github.com/osamanar)! - - Added app implementer to the typical example's auto configuration

- [`54c4ebf`](https://github.com/BeOnAuto/auto-engineer/commit/54c4ebfa0c6866cee6ea4d2315859b8f4a368f3a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: trigger job graph when storybook starts
  - **examples/typical**: trigger job graph when storybook starts
  - **examples/typical**: plugin job processor
  - **global**: version packages

## 1.13.0

### Minor Changes

- [`2e1a735`](https://github.com/BeOnAuto/auto-engineer/commit/2e1a735422598d13288adf09bbeff46f8a547883) Thanks [@osamanar](https://github.com/osamanar)! - - Added automatic job graph triggering when Storybook starts in the typical example project

- [`307baaf`](https://github.com/BeOnAuto/auto-engineer/commit/307baaf131718d89be350862350d9eb902aab131) Thanks [@osamanar](https://github.com/osamanar)! - - Added plugin job processor to the typical example application

- [`ff7c9d4`](https://github.com/BeOnAuto/auto-engineer/commit/ff7c9d4fa56f40a7cd753a13ce40545761cff59a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **examples/typical**: run clietn and storybook when client generated
  - **app-implementer**: adds app implementer
  - **react-component-implementer**: improvements
  - **react-component-implementer**: fixes component implementer always failing
  - **react-component-implementer**: fixes type checker failing

- [`78739a4`](https://github.com/BeOnAuto/auto-engineer/commit/78739a4a5fb926f4f463333bf57521228e1df30d) Thanks [@osamanar](https://github.com/osamanar)! - - Added automatic job graph triggering when Storybook starts in the typical example project

## 1.12.1

### Patch Changes

- [`6557224`](https://github.com/BeOnAuto/auto-engineer/commit/6557224ec6f51c704855e5058931e81ab1de1544) Thanks [@osamanar](https://github.com/osamanar)! - - Updated project dependency lock file to ensure consistent package installations

- [`cd5f56b`](https://github.com/BeOnAuto/auto-engineer/commit/cd5f56b01951cd27392c51a384706a8c2a7401c5) Thanks [@osamanar](https://github.com/osamanar)! - - Removed unused packages to keep the project lean and reduce maintenance overhead

## 1.12.0

### Minor Changes

- [`a425971`](https://github.com/BeOnAuto/auto-engineer/commit/a4259717bdd3bd1c9f0194c9c33c46bbff510f00) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/narrative**: add @xolvio/narrative/schema subpath export
  - **packages/model-diff**: new package for model-level change detection (incremental generation)
  - **packages/server-generator-apollo-emmett**: add incremental generation support via model-diff change sets
  - **global**: version packages
  - **global**: add changeset

## 1.11.0

### Minor Changes

- [`94f3151`](https://github.com/BeOnAuto/auto-engineer/commit/94f315181e69e190f84ba06871b27591e27771c2) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added a lightweight schema subpath export for the narrative package, allowing consumers to import Zod schemas and TypeScript types without pulling in heavy dependencies like typescript, prettier, or graphql

- [`afd1cd2`](https://github.com/BeOnAuto/auto-engineer/commit/afd1cd28412d12ba7c29ba133fdf57616cf42370) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/frontend-implementer**: updates implementation prompt
  - **global**: version packages
  - **global**: add changeset

## 1.10.0

### Minor Changes

- [`f3e6b55`](https://github.com/BeOnAuto/auto-engineer/commit/f3e6b5566b2ab37e4b945bd04168b994f394b33b) Thanks [@osamanar](https://github.com/osamanar)! - - Updated the implementation prompt for the frontend implementer to improve code generation quality

- [`3480c66`](https://github.com/BeOnAuto/auto-engineer/commit/3480c6658781048289c14ee58636825126334d1c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/information-architect**: adds template generation to FE app generation
  - **global**: version packages
  - **global**: add changeset
  - **global**: fix pnpm lock file
  - **global**: add changeset

## 1.9.0

### Minor Changes

- [`9cca67b`](https://github.com/BeOnAuto/auto-engineer/commit/9cca67b7c85953d297a632a268829cc18a168e3a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: implement delegation pattern for FileSyncer reset
  - **global**: version packages
  - **global**: add changeset
  - **global**: update ketchup settings
  - **cli**: update ketchup plan with completed burst

- [#43](https://github.com/BeOnAuto/auto-engineer/pull/43) [`af76242`](https://github.com/BeOnAuto/auto-engineer/commit/af762423f8adfad0796f2f3a6483fb931c7b0bf1) Thanks [@osamanar](https://github.com/osamanar)! - - Added template generation capability to frontend app generation in the information architect package

### Patch Changes

- [#43](https://github.com/BeOnAuto/auto-engineer/pull/43) [`31aab4f`](https://github.com/BeOnAuto/auto-engineer/commit/31aab4f3114d6fd8f60fa2239fff9d567a78e321) Thanks [@osamanar](https://github.com/osamanar)! - - Fixed package manager lock file to ensure consistent dependency installation

## 1.8.0

### Minor Changes

- [`c383ec4`](https://github.com/BeOnAuto/auto-engineer/commit/c383ec4bae483e32d6b747575f2311a67e488a41) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Implemented delegation pattern for FileSyncer reset, allowing the server to swap file syncer instances without re-registering socket handlers
  - Made FileSyncer stop operation async and idempotent with proper startup/shutdown guards
  - Updated ketchup development workflow settings

- [`9479f7a`](https://github.com/BeOnAuto/auto-engineer/commit/9479f7a5ebb999907028873cdfcc43b692bfe28a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: default file sync directory to narratives
  - **husky**: handle non-zero exit codes from changeset generator under sh -e
  - **global**: version packages
  - **global**: add changeset
  - **global**: exclude .ketchup from biome checks

## 1.7.0

### Minor Changes

- [`876f240`](https://github.com/BeOnAuto/auto-engineer/commit/876f24011aa2b97fcfdd226de4c33756ce10dc13) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add MappingEntrySchema, update slice schemas to use structured mappings
  - **narrative**: add MappingFieldRefSchema for structured mapping references
  - **global**: version packages

- [`22da0bb`](https://github.com/BeOnAuto/auto-engineer/commit/22da0bba412bdc78ef7aded96a4d6acafdd6aafc) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Changed file sync default directory to "narratives" for better organization of synchronized content

### Patch Changes

- [`86e9bc9`](https://github.com/BeOnAuto/auto-engineer/commit/86e9bc95d163bb6ea8861cb4db2fa39905e9afc2) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed an issue where the changeset generator could cause failures in strict shell environments by properly handling non-zero exit codes

- [`b0ca671`](https://github.com/BeOnAuto/auto-engineer/commit/b0ca6714c090f5ce3b0831353efc2a94f4ad0321) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added Ketchup configuration for the project

- [`1783963`](https://github.com/BeOnAuto/auto-engineer/commit/17839632724eaae84bfbbe8f0b90cc6b777c0eff) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Excluded .ketchup directory from code formatting and linting checks

- [`6eb8e24`](https://github.com/BeOnAuto/auto-engineer/commit/6eb8e242410b7c396472aa720c137400f694ec9b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - Here's the changelog based on the actual changes:
  - Added structured mapping schemas to narrative slices, enabling field-level mapping references between commands and queries
  - Fixed changeset generator failures in strict shell environments by properly handling non-zero exit codes
  - Added Ketchup configuration for project automation, validation rules, and development workflow hooks

- [`1ebdd34`](https://github.com/BeOnAuto/auto-engineer/commit/1ebdd3475f00e20a6e47e5306d0e2abd743b6067) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed an issue where the changeset generator could fail in strict shell environments due to non-zero exit codes

## 1.6.0

### Minor Changes

- [`c47d7b7`](https://github.com/BeOnAuto/auto-engineer/commit/c47d7b7b5de04a4da7d5f2ce62211cbe64e23603) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add optional mappings field to CommandSliceSchema and QuerySliceSchema
  - **global**: version packages

## 1.5.5

### Patch Changes

- [`237ff60`](https://github.com/BeOnAuto/auto-engineer/commit/237ff604674b188645017b7f80cf5d248aadc5b1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **pipeline**: register foreach-phased handlers with PhasedExecutor
  - **global**: version packages
  - **global**: add changeset

## 1.5.4

### Patch Changes

- [`4eeece7`](https://github.com/BeOnAuto/auto-engineer/commit/4eeece7f0894d49e62b374dd0461d9a41bbe169b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: wrap Date fields in nested objects and arrays with new Date()
  - **global**: version packages
  - **global**: add changeset

- [`867ff17`](https://github.com/BeOnAuto/auto-engineer/commit/867ff17b14e0167f362a88a7d14b6b6e75702774) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed registration of foreach-phased handlers to properly work with the PhasedExecutor

## 1.5.3

### Patch Changes

- [`6a7fa7f`](https://github.com/BeOnAuto/auto-engineer/commit/6a7fa7f848f45bad2b2e97e39404155d8987623d) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed Date fields not being properly converted when nested inside objects and arrays

- [`d7f22bb`](https://github.com/BeOnAuto/auto-engineer/commit/d7f22bbe745dc14ebd273d4ffa24ffe62adb95c0) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: export cross-module types and improve Date field handling
  - **global**: version packages
  - **global**: add changeset

## 1.5.2

### Patch Changes

- [`02f70b8`](https://github.com/BeOnAuto/auto-engineer/commit/02f70b8e3be0655ab340c53e2ac2082a3ddc10ef) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: use browser-compatible path utilities in cross-module-imports
  - **global**: version packages
  - **global**: add changeset

- [`e5883d0`](https://github.com/BeOnAuto/auto-engineer/commit/e5883d0db038d1f95645a46ce528cbd153bde277) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Exported cross-module types for better integration between modules
  - Improved Date field handling in the narrative package

## 1.5.1

### Patch Changes

- [`6afefa3`](https://github.com/BeOnAuto/auto-engineer/commit/6afefa3cd483930b2cea1933f6b0d3e84a546a9b) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add query support to isMessageKind type guard
  - **global**: version packages
  - **global**: add changeset

- [`6edb039`](https://github.com/BeOnAuto/auto-engineer/commit/6edb0394444edcab597b6d149b3928debe9824c8) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed browser compatibility issues with path utilities in cross-module imports

## 1.5.0

### Minor Changes

- [`0cc358d`](https://github.com/BeOnAuto/auto-engineer/commit/0cc358da85ce6b62a786d66d9ecd7da63299e169) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: add query detection for When clauses in query slices
  - **global**: version packages
  - **global**: add changeset

### Patch Changes

- [`ad7cd86`](https://github.com/BeOnAuto/auto-engineer/commit/ad7cd868b47194512938a26fc34b15d6e6de7dd4) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added query support to the isMessageKind type guard in the narrative package

## 1.4.0

### Minor Changes

- [`c2503a1`](https://github.com/BeOnAuto/auto-engineer/commit/c2503a1cfb342ab1399a382d175def1a8239e2b9) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Added query detection for When clauses in query slices, enabling better handling of query-based conditions in narrative definitions

### Patch Changes

- [`a0cf1a8`](https://github.com/BeOnAuto/auto-engineer/commit/a0cf1a8a41faa1a8f4687b0b80be745d1f7a0091) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: generate all declared types for authored modules
  - **global**: version packages
  - **global**: add changeset

## 1.3.4

### Patch Changes

- [`f2ee305`](https://github.com/BeOnAuto/auto-engineer/commit/f2ee305eb055873d93cfe30f2a0f49ee297393c1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: handle negative numbers in jsonToExpr
  - **global**: version packages
  - **global**: add changeset

- [`22916b0`](https://github.com/BeOnAuto/auto-engineer/commit/22916b01abc8cee787e79be7aea01de579e30ec3) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed type generation to include all declared types for authored modules

## 1.3.3

### Patch Changes

- [`6832039`](https://github.com/BeOnAuto/auto-engineer/commit/683203980ec147c5b9de506f8a97303b7f5d39c3) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: handle empty then array in chainThenCall
  - **global**: version packages
  - **global**: add changeset

- [`03cdbfd`](https://github.com/BeOnAuto/auto-engineer/commit/03cdbfdfe934152d5ff7118608ef96ead56b032b) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed handling of negative numbers in expression conversion

## 1.3.2

### Patch Changes

- [`f382d2a`](https://github.com/BeOnAuto/auto-engineer/commit/f382d2a5e02cba90a4a772088dd1d46fd9470929) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **narrative**: republish with correct workspace dependency resolution
  - **global**: version packages
  - **global**: add changeset

- [`4c060da`](https://github.com/BeOnAuto/auto-engineer/commit/4c060da8da6f08f0d689f513c9b3e67af46766de) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed an issue where empty action chains could cause errors in the narrative system

## 1.3.1

### Patch Changes

- [`f6ec207`](https://github.com/BeOnAuto/auto-engineer/commit/f6ec207cd6cd3457aca2ab8202677101fe531cd6) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed workspace dependency resolution for the narrative package to ensure correct publishing

## 2.0.0

### Major Changes

- [`c3a1f4f`](https://github.com/BeOnAuto/auto-engineer/commit/c3a1f4f51bdda9cd97f839c0f9a3d2664518388a) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **cli**: rename suspend hooks to generic shutdown hooks (#42)

### Patch Changes

- [`6770053`](https://github.com/BeOnAuto/auto-engineer/commit/67700538ddd17656eb0de17b1a16d5f7e4ca14f6) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Fixed incorrect argument order in test code generation for it/describe blocks

## 1.2.0

### Minor Changes

- [`d1865ee`](https://github.com/BeOnAuto/auto-engineer/commit/d1865eeaf0f18e311c61cca0e233d68a6c2f57a9) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - Graceful Worker Suspend with UI Disconnect (#41)
  - **global**: version packages

## 1.1.2

### Patch Changes

- [`1695c1d`](https://github.com/BeOnAuto/auto-engineer/commit/1695c1d715bfcf404e5dcf0ed503a6aa78648c66) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: use new commit instead of amend for changesets
  - **global**: version packages

## 1.1.1

### Patch Changes

- [`0d9693f`](https://github.com/BeOnAuto/auto-engineer/commit/0d9693fee7c2a4105b104204b96773ffaebaecd6) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **root**: check remote status before generating changesets
  - **global**: version packages

## 1.1.0

### Minor Changes

- [`6b4be43`](https://github.com/BeOnAuto/auto-engineer/commit/6b4be43ce12cf8562f7202ce7272bcbb0bca9a85) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: expose messageBus on ServerHandle, remove onEvent option
  - **global**: version packages

## 1.0.2

### Patch Changes

- [`d7d07cb`](https://github.com/BeOnAuto/auto-engineer/commit/d7d07cb7c699496d61b6794391aa6a57d7a1af44) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: remove completed ketchup plan
  - **global**: version packages
  - **global**: update ketchup plan - Burst 4 complete
  - **pipeline**: update ketchup plan - Burst 4 blocked on CLI publish

## 1.0.1

### Patch Changes

- [`f8360ec`](https://github.com/BeOnAuto/auto-engineer/commit/f8360ec5e39297cbfd1a2ffb13ec83592ce12b13) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: update ketchup plan - Burst 4 complete
  - **pipeline**: update ketchup plan - Burst 4 blocked on CLI publish

- [`17c8146`](https://github.com/BeOnAuto/auto-engineer/commit/17c814614c42f24f7a6fe1dc407ed4298994ea4d) Thanks [@SamHatoum](https://github.com/SamHatoum)! - Looking at these commits, they are both internal housekeeping changes related to a "ketchup plan" (which appears to be a development workflow tracking document based on the CLAUDE.md context). These are not user-facing changes.
  - Updated internal development tracking documentation

## 1.0.0

### Major Changes

- [`b00fcec`](https://github.com/BeOnAuto/auto-engineer/commit/b00fcece918f10c391ac24606baf0ac1d882bff9) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Added event subscription API to pipeline server, allowing external code to subscribe to all pipeline events via `getMessageBus()` and `subscribeAll()`
  - Replaced `onPipelineActivity` callback with `onEvent` in CLI server options for true event-sourced activity tracking (breaking change)
  - Added support for loading command handlers directly from config files via `COMMANDS` array export

- [`e46d374`](https://github.com/BeOnAuto/auto-engineer/commit/e46d374fbaea0ed20b865cca3961966448e704e3) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **cli**: replace onPipelineActivity with onEvent using subscribeAll
  - **cli**: load COMMANDS from config file as command handlers
  - **pipeline**: publish events to message bus when command handlers emit
  - **pipeline**: export MessageBus, EventHandler, EventSubscription types
  - **pipeline**: add getMessageBus() method to PipelineServer

## 0.26.3

### Patch Changes

- [`e2539a5`](https://github.com/BeOnAuto/auto-engineer/commit/e2539a5c1e0648ae297d4f49680b4699fd67f075) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **narrative**: remove redundant id field from Module, use sourceFile as identifier

## 0.26.2

### Patch Changes

- [`6fc3c3f`](https://github.com/BeOnAuto/auto-engineer/commit/6fc3c3f3b83a534963749a21b56d53b34f65ed97) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: version packages
  - **global**: consolidate CI into single job
  - **global**: merge publish workflow into build-and-test

- [`21d6645`](https://github.com/BeOnAuto/auto-engineer/commit/21d6645c53ae0da46e7557a9dac058e7da0afd67) Thanks [@rami-hatoum](https://github.com/rami-hatoum)! - - Simplified module identification by using source file path instead of separate ID field

## 0.26.1

### Patch Changes

- [`55262c8`](https://github.com/BeOnAuto/auto-engineer/commit/55262c8b74a0e5bf4e2bde2dc393486ddef7ed1c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Merged the publish workflow into the build-and-test workflow for faster, more streamlined releases
  - Eliminated workflow trigger delays by running release jobs directly after successful builds on main branch

- [`f3a86f3`](https://github.com/BeOnAuto/auto-engineer/commit/f3a86f39e11b1bf0161372f2a6ccdca710967430) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **global**: read version from cli package and skip hooks for tag push
  - **global**: version packages
  - **global**: merge publish workflow into build-and-test

- [`65817de`](https://github.com/BeOnAuto/auto-engineer/commit/65817debd6cc7333e1a1d165433a2e23441a4270) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Consolidated CI workflow into a single job, reducing release build time from ~4 minutes to ~1 minute
  - Release steps now run conditionally only on main branch pushes

## 0.26.0

### Minor Changes

- [`43c5ec3`](https://github.com/BeOnAuto/auto-engineer/commit/43c5ec3bdd4dbfbacf09e6e3d15f9dadb273c9c1) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/narrative**: adds id field to data
  - **cli**: consolidate servers onto single port
  - **pipeline**: add getHttpServer() method to PipelineServer
  - **cli**: update package.json exports for server and add types
  - **cli**: update Ketchup Plan and streamline startServer implementation

### Patch Changes

- [`4d1f540`](https://github.com/BeOnAuto/auto-engineer/commit/4d1f540e37a7a28d3b1ee0abc249d934553b4359) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed version reading to use CLI package instead of root package.json
  - Improved tag push workflow by skipping pre-push hooks
  - Cleaned up duplicate tagging for create-auto-app package

## 0.25.0

### Minor Changes

- [`dd69fb0`](https://github.com/BeOnAuto/auto-engineer/commit/dd69fb082429603d093c49b974d0a83514828f6f) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/narrative**: adds id field to data
  - **cli**: consolidate servers onto single port
  - **pipeline**: add getHttpServer() method to PipelineServer
  - **cli**: update package.json exports for server and add types
  - **cli**: update Ketchup Plan and streamline startServer implementation

## 0.24.0

### Minor Changes

- [`9f33c48`](https://github.com/BeOnAuto/auto-engineer/commit/9f33c48a5e345b4e0735951c2b77d47d5e936d78) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - - **packages/narrative**: adds id field to data
  - **cli**: consolidate servers onto single port
  - **pipeline**: add getHttpServer() method to PipelineServer
  - **cli**: update package.json exports for server and add types
  - **cli**: update Ketchup Plan and streamline startServer implementation

## 0.23.0

### Minor Changes

- [#40](https://github.com/BeOnAuto/auto-engineer/pull/40) [`c7e4f17`](https://github.com/BeOnAuto/auto-engineer/commit/c7e4f1774937ead19fe46e9d3ca19208cbc24f16) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: add OSS-friendly fallbacks for changeset generation
  - **global**: automate release workflow with pre-push changesets
  - **packages/narrative**: adds id field to data
  - **cli**: consolidate servers onto single port
  - **pipeline**: add getHttpServer() method to PipelineServer

- [#40](https://github.com/BeOnAuto/auto-engineer/pull/40) [`c7e4f17`](https://github.com/BeOnAuto/auto-engineer/commit/c7e4f1774937ead19fe46e9d3ca19208cbc24f16) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: create @xolvio/release-automation package

### Patch Changes

- [`48a1981`](https://github.com/BeOnAuto/auto-engineer/commit/48a1981f2ea9e345a62f1cedd646016a9fb5ace0) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Consolidated CI jobs for more efficient build and release processes
  - Fixed binary linking issue in release automation that could prevent proper package publishing

- [#40](https://github.com/BeOnAuto/auto-engineer/pull/40) [`c7e4f17`](https://github.com/BeOnAuto/auto-engineer/commit/c7e4f1774937ead19fe46e9d3ca19208cbc24f16) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - **global**: add explicit exit 0 to pre-push hook

- [`42ad1e5`](https://github.com/BeOnAuto/auto-engineer/commit/42ad1e5bb31b89b56b920ed84a151a7c68dd2e5b) Thanks [@SamHatoum](https://github.com/SamHatoum)! - - Fixed an issue where special characters in commit messages could break Slack notifications

## 0.22.0

### Minor Changes

- Adds id field to data sink and data source

## 0.21.2

## 0.21.0

### Minor Changes

- Unifies ports on cli

## 0.20.0

## 0.19.0

### Minor Changes

- adds "typical" example

## 0.18.0

### Minor Changes

- Add middleware support

## 0.17.1

## 0.17.0

### Minor Changes

- Adds new minimal example

## 0.16.0

## 0.15.0

### Minor Changes

- version bump

## 0.14.0

### Minor Changes

- Rewrite CLI and Pipeline

## 0.13.3

## 0.13.2

## 0.13.1

## 0.13.0

### Minor Changes

- Removes auto prefix from ids

## 0.12.1

## 0.12.0

### Minor Changes

- Upgrade vercel ai sdk

## 0.11.20

## 0.11.19

## 0.11.18

## 0.11.17

## 0.11.16

### Patch Changes

- version bump

## 0.11.15

## 0.11.14

## 0.11.13

## 0.11.12

## 0.11.11

### Patch Changes

- Change flow to Narrative

## 0.11.10

## 0.11.9

### Patch Changes

- Upgrade oai to gpt-5

## 0.11.8

### Patch Changes

- fix kanban todo paths

## 0.11.7

### Patch Changes

- Fix template paths issue

## 0.11.6

### Patch Changes

- fix test retries

## 0.11.5

### Patch Changes

- Fix paths and deps issues

## 0.11.4

## 0.11.3

## 0.11.2

### Patch Changes

- Fixes pipeline not showing

## 0.11.1

### Patch Changes

- Updates missing deps for todo-list example

## 0.11.0

### Minor Changes

- Version bump

## 0.10.5

## 0.10.4

## 0.10.3

## 0.10.2

## 0.10.1

## 0.10.0

### Minor Changes

- New templates and bug fixes

## 0.9.13

## 0.9.12

## 0.9.11

## 0.9.10

## 0.9.9

## 0.9.8

## 0.9.7

## 0.9.6

## 0.9.5

## 0.9.4

## 0.9.3

## 0.9.2

## 0.9.1

## 0.9.0

### Minor Changes

- add a new experience slice type

## 0.8.14

### Patch Changes

- Update flow to not require slice

## 0.8.13

## 0.8.12

## 0.8.11

## 0.8.10

## 0.8.9

## 0.8.8

## 0.8.7

## 0.8.6

## 0.8.5

## 0.8.4

## 0.8.3

### Patch Changes

- 3aff24e: bump version up
- version bump

## 0.8.2

## 0.6.0

### Minor Changes

- add command details in dashboard

## 0.5.5

### Patch Changes

- Bump versions

## 0.5.4

### Patch Changes

- version test

## 0.5.3

### Patch Changes

- fix version report

## 0.5.2

### Patch Changes

- renamed packages

## 0.5.1

### Patch Changes

- version bump for testihng

## 0.5.0

### Minor Changes

- Major overhaul of the plugin system

## 0.4.0

### Minor Changes

- • All cli commands now use commands and emit events on the bus

## 0.3.3

### Patch Changes

- version testing

## 0.3.2

### Patch Changes

- Bump versions

## 0.3.1

### Patch Changes

- Version bump to trigger builds

## 0.3.0

### Minor Changes

- [#22](https://github.com/SamHatoum/auto-engineer/pull/22) [`927b39a`](https://github.com/SamHatoum/auto-engineer/commit/927b39a2c08c0baa1942b2955a8e8015e09364d9) Thanks [@SamHatoum](https://github.com/SamHatoum)! - Some major refactorings of the directory structure

### Patch Changes

- [`f3e97e5`](https://github.com/SamHatoum/auto-engineer/commit/f3e97e563b79ca8328e802dd502e65285ec58ce9) Thanks [@SamHatoum](https://github.com/SamHatoum)! - global version bump to test release process

## 0.2.0

### Minor Changes

- [`330afa5`](https://github.com/SamHatoum/auto-engineer/commit/330afa565079e3b528d0f448d64919a8dc78d684) Thanks [@SamHatoum](https://github.com/SamHatoum)! - Fix multiple dependency issues

## 0.1.0

### Minor Changes

- [#22](https://github.com/SamHatoum/auto-engineer/pull/22) [`e39acf3`](https://github.com/SamHatoum/auto-engineer/commit/e39acf31e9051652084d0de99cf8c89b40e6531c) Thanks [@SamHatoum](https://github.com/SamHatoum)! - Some major refactorings of the directory structure

## 0.0.3

### Patch Changes

- Fix workspace:\* dependencies to use actual version numbers for npm publishing

## 0.0.2

### Patch Changes

- Bump versions to fix npm publish conflicts
