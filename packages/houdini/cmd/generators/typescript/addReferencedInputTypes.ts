// externals
import { Config } from 'houdini-common'
import * as recast from 'recast'
import * as graphql from 'graphql'
import { StatementKind, TSPropertySignatureKind } from 'ast-types/gen/kinds'
// locals
import { unwrapType } from '../../utils'
import { tsTypeReference } from './typeReference'

const AST = recast.types.builders

// add any object types found in the input
export function addReferencedInputTypes(
	config: Config,
	body: StatementKind[],
	visitedTypes: Set<string>,
	rootType: graphql.TypeNode
) {
	// try to find the name of the type
	const { type } = unwrapType(config, rootType)

	// if we are looking at a scalar
	if (graphql.isScalarType(type)) {
		// we're done
		return
	}

	// if we have already processed this type, dont do anything
	if (visitedTypes.has(type.name)) {
		return
	}

	// if we ran into a union
	if (graphql.isUnionType(type)) {
		// we don't support them yet
		throw new Error('Unions are not supported yet. Sorry!')
	}

	// track that we are processing the type
	visitedTypes.add(type.name)

	// if we ran into an enum, add its definition to the file
	if (graphql.isEnumType(type)) {
		body.push(
			AST.tsEnumDeclaration(
				AST.identifier(type.name),
				type
					.getValues()
					.map((value) =>
						AST.tsEnumMember(AST.identifier(value.name), AST.stringLiteral(value.name))
					)
			)
		)
		return
	}

	// we found an object type so build up the list of fields (and walk down any object fields)
	const members: TSPropertySignatureKind[] = []

	for (const field of Object.values(type.getFields())) {
		// walk down the referenced fields and build stuff back up
		addReferencedInputTypes(config, body, visitedTypes, field.type)

		// check if the type is optional so we can label the value as omitable
		members.push(
			AST.tsPropertySignature(
				{
					...AST.identifier(field.name),
					optional: graphql.isNullableType(field.type),
				},
				AST.tsTypeAnnotation(tsTypeReference(config, field))
			)
		)
	}

	// add the type def to the body
	body.push(AST.tsTypeAliasDeclaration(AST.identifier(type.name), AST.tsTypeLiteral(members)))
}
