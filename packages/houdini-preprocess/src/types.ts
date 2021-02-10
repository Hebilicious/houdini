// externals
import { Script } from 'svelte/types/compiler/interfaces'
import { Config } from 'houdini-common'
import { Patch } from 'houdini-compiler'

type Module<T> = Promise<{ default: T }>

export type Maybe<T> = T | undefined

export type TaggedGraphqlFragment = {
	name: string
	kind: 'HoudiniFragment'
	applyMask: (root: any) => any
}

// the result of tagging an operation
export type TaggedGraphqlMutation = {
	name: string
	kind: 'HoudiniMutation'
	raw: string
	processResult: (result: any) => any
	links: Module<() => { [queryName: string]: Module<Patch> }>
}

// the result of tagging an operation
export type TaggedGraphqlQuery = {
	name: string
	kind: 'HoudiniQuery'
	raw: string
	processResult: (result: any) => any
	initialValue: any
}

// the result of the template tag
export type GraphQLTagResult = TaggedGraphqlQuery | TaggedGraphqlFragment | TaggedGraphqlMutation

export type TransformDocument = {
	instance: Maybe<Script>
	module: Maybe<Script>
	config: Config
	dependencies: string[]
	filename: string
}