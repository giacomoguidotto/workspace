#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'usage: %s check|reconcile <harness-skill-root>\n' "$0" >&2
  exit 64
}

[ "$#" -eq 2 ] || usage
mode=$1
harness_root=$2
case "$mode" in
  check|reconcile) ;;
  *) usage ;;
esac

[ -n "$harness_root" ] || usage
case "$harness_root" in
  /|.|..) printf 'unsafe harness skill root: %s\n' "$harness_root" >&2; exit 65 ;;
esac

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source_tree=$(cd "$script_dir/../resources/knowledge-system-interface/v1" && pwd)
interface_parent="$harness_root/knowledge-system-interface"
target_tree="$interface_parent/v1"
validator='validate-snapshot-token.py'

if [ ! -x "$source_tree/$validator" ] || ! "$source_tree/$validator" --self-check >/dev/null; then
  printf 'bundled snapshot token validator is not ready\n' >&2
  exit 66
fi

capability_state='blocked'
capability_reason='validator_missing'
if [ -x "$target_tree/$validator" ]; then
  if "$target_tree/$validator" --self-check >/dev/null; then
    capability_state='ready'
    capability_reason='none'
  else
    capability_reason='self_check_failed'
  fi
fi

if [ -d "$target_tree" ]; then
  if diff -qr "$source_tree" "$target_tree" >/dev/null; then
    if [ "$capability_state" = ready ]; then
      printf 'state=converged writes=0 capability=snapshot-token-validation capability_state=ready target=%s\n' "$target_tree"
      exit 0
    fi
    if [ "$mode" = check ]; then
      printf 'state=drifted writes=0 capability=snapshot-token-validation capability_state=blocked reason=%s target=%s\n' \
        "$capability_reason" "$target_tree"
      exit 0
    fi
  else
    diff_status=$?
    if [ "$diff_status" -ne 1 ]; then
      printf 'cannot compare interface target: %s\n' "$target_tree" >&2
      exit 68
    fi
  fi
fi

if [ "$mode" = check ]; then
  printf 'state=drifted writes=0 capability=snapshot-token-validation capability_state=%s reason=%s target=%s\n' \
    "$capability_state" "$capability_reason" "$target_tree"
  exit 0
fi

mkdir -p "$interface_parent"
candidate=$(mktemp -d "$interface_parent/.v1-candidate.XXXXXX")
backup=''
cleanup() {
  [ ! -d "$candidate" ] || rm -rf "$candidate"
  if [ -n "$backup" ] && [ -d "$backup" ] && [ ! -e "$target_tree" ]; then
    mv "$backup" "$target_tree"
  fi
}
trap cleanup EXIT

cp -R "$source_tree/." "$candidate/"
if find "$candidate" -name SKILL.md -print -quit | grep -q .; then
  printf 'candidate interface contains SKILL.md\n' >&2
  exit 66
fi
if [ ! -x "$candidate/$validator" ] || ! "$candidate/$validator" --self-check >/dev/null; then
  printf 'candidate snapshot token validator is not ready\n' >&2
  exit 66
fi
if ! diff -qr "$source_tree" "$candidate" >/dev/null; then
  printf 'candidate interface copy failed validation\n' >&2
  exit 69
fi

if [ -e "$target_tree" ]; then
  backup="$interface_parent/.v1-backup.$$"
  [ ! -e "$backup" ] || { printf 'backup path already exists: %s\n' "$backup" >&2; exit 67; }
  mv "$target_tree" "$backup"
fi
mv "$candidate" "$target_tree"
candidate=''
if [ -n "$backup" ]; then
  rm -rf "$backup"
  backup=''
fi
trap - EXIT

printf 'state=converged writes=1 capability=snapshot-token-validation capability_state=ready target=%s\n' "$target_tree"
